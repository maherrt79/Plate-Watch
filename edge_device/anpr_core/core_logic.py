import re
import cv2
from collections import Counter
import anpr_core.config as config

def validate_and_clean_plate(text):
    """
    Validate and clean UK license plate text.
    1. Remove spaces/upper.
    2. Apply positional correction (0->O, I->1 etc) if length is 7.
    3. Strict Regex check.
    Returns: (is_valid, formatted_text)
    """
    # 1. Basic Cleanup
    text = text.replace(" ", "").upper()
    
    # 2. Positional Correction (if length is 7)
    # Standard UK format: LLNNLLL (7 chars)
    if config.ENABLE_CHAR_CORRECTION and len(text) == 7:
        text_list = list(text)
        
        # Correction dictionaries
        dict_num_to_char = {'0': 'O', '1': 'I', '8': 'B'}
        dict_char_to_num = {'O': '0', 'Q': '0', 'I': '1', 'L': '1', 'Z': '2', 'B': '8', 'S': '5'}
        
        # Indices 0, 1, 4, 5, 6 (Letters)
        for i in [0, 1, 4, 5, 6]:
            if text_list[i] in dict_num_to_char:
                text_list[i] = dict_num_to_char[text_list[i]]
        
        # Indices 2, 3 (Numbers)
        for i in [2, 3]:
            if text_list[i] in dict_char_to_num:
                text_list[i] = dict_char_to_num[text_list[i]]
        
        text = "".join(text_list)

    # 3. Strict Regex Check
    if config.ENABLE_STRICT_REGEX:
        match = re.search(config.UK_REGEX, text)
        if match:
             # Formatted: "AB12 CDE"
             formatted = text[:4] + " " + text[4:]
             return True, formatted
        return False, None
    else:
        # If Regex disabled, just try to format if length is correct, else return raw
        if len(text) == 7:
            formatted = text[:4] + " " + text[4:]
            return True, formatted
        return True, text # Return as-is if no validation enforced

def process_plate_detection(frame, vehicle_box, plate_detector, reader, annotated_frame):
    """
    Detects plate on the vehicle crop, pads it, and performs OCR.
    Returns valid text or None.
    """
    x1, y1, x2, y2 = vehicle_box
    car_crop = frame[y1:y2, x1:x2]
    
    if car_crop.size == 0:
        return None, 0.0, 0

    # Detect Plate
    plate_box = plate_detector.detect_plate(car_crop)
    if not plate_box:
        return None, 0.0, 0
    
    px, py, pw, ph = plate_box
    
    # Apply 10% Padding
    pad_w = int(pw * 0.1)
    pad_h = int(ph * 0.1)
    
    # Calculate padded coordinates clamped to car crop
    pad_px = max(0, px - pad_w)
    pad_py = max(0, py - pad_h)
    pad_pw = min(car_crop.shape[1] - pad_px, pw + 2 * pad_w)
    pad_ph = min(car_crop.shape[0] - pad_py, ph + 2 * pad_h)

    # Visualization (Magenta Box for Plate)
    if annotated_frame is not None:
        cv2.rectangle(annotated_frame, (x1+pad_px, y1+pad_py), (x1+pad_px+pad_pw, y1+pad_py+pad_ph), (255, 0, 255), 2)
    
    # Crop Plate
    plate_crop = car_crop[pad_py:pad_py+pad_ph, pad_px:pad_px+pad_pw]
    
    if plate_crop.size == 0:
        return None, 0.0, 0

    # OCR
    results = reader.read_text(plate_crop, det=False, enable_logic=config.ENABLE_OCR_LOGIC_LAYER)
    
    if not results:
        return None, 0.0, 0
        
    # Validation
    valid_texts = []
    valid_confs = []
    for (text, conf, _) in results:
        is_valid, clean_text = validate_and_clean_plate(text)
        if is_valid:
            valid_texts.append(clean_text)
            valid_confs.append(conf)
            
    if valid_texts:
        final_text = " ".join(valid_texts)
        avg_conf = sum(valid_confs) / len(valid_confs)
        area = pw * ph 
        return final_text, avg_conf, area
        
    return None, 0.0, 0

class VehicleTracker:
    def __init__(self):
        # {track_id: {'reads': [], 'last_seen': 0, 'finalized': False}}
        self.vehicle_data = {}
        
    def update(self, track_id, frame_count):
        if track_id not in self.vehicle_data:
            self.vehicle_data[track_id] = {'reads': [], 'last_seen': frame_count, 'finalized': False}
        else:
            self.vehicle_data[track_id]['last_seen'] = frame_count
            
    def add_read(self, track_id, text, conf, area):
        if track_id in self.vehicle_data:
            self.vehicle_data[track_id]['reads'].append((text, conf, area))

    def check_exiting_vehicles(self, current_frame_count):
        """
        Checks for vehicles that haven't been seen for > 15 frames and finalizes them.
        Returns a dict of finalized vehicle data.
        """
        finalized_this_frame = {}
        
        for t_id in list(self.vehicle_data.keys()):
            data = self.vehicle_data[t_id]
            
            # If not finalized AND abandoned (not seen for > 15 frames)
            if not data['finalized'] and (current_frame_count - data['last_seen'] > 15):
                reads = data['reads']
                if reads:
                    # _finalize_vote usually prints result. We want to capture it.
                    # Let's peek at _finalize_vote if possible, but assuming we can just calculate it here or let _finalize_vote populate 'best_plate'.
                    self._finalize_vote(t_id, reads)
                    
                    # Assuming _finalize_vote or the process populates 'best_plate'
                    if 'best_plate' in data and data['best_plate']:
                         finalized_this_frame[t_id] = {
                             'best_plate': data['best_plate'],
                             'confidence': data.get('confidence', 0.0),
                             'history': reads
                         }
                else:
                    print(f"❌ Vehicle {t_id} Left Frame. No valid UK plates read.")
                
                data['finalized'] = True
                
        return finalized_this_frame

    def _finalize_vote(self, t_id, reads):
        # 1. Weighted Vote (Best Single Read)
        vote_scores = {}
        vote_counts = {}
        
        for text, conf, area in reads:
            # Resolution Weighting: Area / 5000.0
            weight = 1.0
            if config.ENABLE_RESOLUTION_WEIGHTING:
                weight = area / 5000.0
            
            # Confidence Weighting
            score = weight 
            if config.ENABLE_CONFIDENCE_WEIGHTING:
                score = conf * weight
            
            vote_scores[text] = vote_scores.get(text, 0) + score
            vote_counts[text] = vote_counts.get(text, 0) + 1
        
        # Debug: Print all candidates
        print(f"\n🔍 Debugging Vehicle {t_id}:")
        for txt, sc in vote_scores.items():
            print(f"   - '{txt}': Score {sc:.2f} (Votes: {vote_counts[txt]})")
        
        # Winner is max score
        final_text = max(vote_scores, key=vote_scores.get)
        vote_count = vote_counts[final_text]
        
        print(f"✅ Vehicle {t_id} Left Frame. Best Read: {final_text} (Score: {vote_scores[final_text]:.2f}, Votes: {vote_count}/{len(reads)})")
    
        self.vehicle_data[t_id]['best_plate'] = final_text
        self.vehicle_data[t_id]['confidence'] = vote_scores[final_text] / max(1.0, float(len(reads))) # Rough normalization

        # 2. Character-Level Voting (Positional Consensus)
        if config.ENABLE_POSITIONAL_VOTING:
            self._positional_consensus(final_text, reads)

    def _positional_consensus(self, final_text, reads):
        # Filter for reads that are standard UK length (7 chars without space)
        valid_cons_reads = [ (r[0].replace(" ", ""), r[1], r[2]) for r in reads if len(r[0].replace(" ", "")) == 7 ]
        
        if len(valid_cons_reads) > 1:
            constructed_plate = []
            # For each of the 7 positions
            for i in range(7):
                char_scores = {}
                for r_text, r_conf, r_area in valid_cons_reads:
                    # Use same weighting logic for chars
                    weight = 1.0
                    if config.ENABLE_RESOLUTION_WEIGHTING:
                        weight = r_area / 5000.0
                    
                    r_score = weight
                    if config.ENABLE_CONFIDENCE_WEIGHTING:
                        r_score = r_conf * weight
                    
                    char = r_text[i]
                    char_scores[char] = char_scores.get(char, 0) + r_score
                
                # Debug: Print char votes if ambiguous
                if len(char_scores) > 1:
                     sorted_chars = sorted(char_scores.items(), key=lambda x: x[1], reverse=True)
                     debug_str = ", ".join([f"'{c}':{s:.2f}" for c, s in sorted_chars])
                     print(f"   - Pos {i}: {debug_str}")
                
                # Best char for this position
                best_char = max(char_scores, key=char_scores.get)
                constructed_plate.append(best_char)
            
            consensus_text = "".join(constructed_plate)
            # Re-format with space
            consensus_formatted = consensus_text[:4] + " " + consensus_text[4:]
            
            if consensus_formatted != final_text:
                 print(f"   ✨ Consensus Reconstructed: {consensus_formatted} (Merged from {len(valid_cons_reads)} reads)")
