def calculate_risk(ai_probability: float, audio_quality_score: int):
    # Calculate baseline AI probability score out of 100
    ai_prob_score = ai_probability * 100
    
    # Calculate the combined resultant risk score, scaling slightly when audio quality is high
    # (Humans can have high quality audio too, so weight is kept at 15%)
    resultant_score = (ai_prob_score * 0.85) + (audio_quality_score * 0.15)
    risk_score = round(resultant_score)

    if 40 <= risk_score <= 60:
        is_ai_generated = "Uncertain"
        risk_level = "MEDIUM"
        message = "Model is highly uncertain about this voice pattern. Audio artifacts or ambiguity prevents confident classification."
    elif risk_score >= 80:
        is_ai_generated = True
        risk_level = "CRITICAL"
        message = "High probability of AI-generated voice detected."
    elif risk_score >= 60:
        is_ai_generated = True
        risk_level = "HIGH"
        message = "Possible AI-generated voice detected."
    elif risk_score >= 40:
        is_ai_generated = False
        risk_level = "MEDIUM"
        message = "Voice leans towards human, but requires verification."
    else:
        is_ai_generated = False
        risk_level = "LOW"
        message = "Voice appears likely to be human."

    return {
        "is_ai_generated": is_ai_generated,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "message": message
    }