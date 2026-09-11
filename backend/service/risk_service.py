def calculate_risk(ai_probability: float):

    risk_score = round(ai_probability * 100)

    if risk_score >= 80:
        risk_level = "CRITICAL"
        message = "High probability of AI-generated voice detected."

    elif risk_score >= 60:
        risk_level = "HIGH"
        message = "Possible AI-generated voice detected."

    elif risk_score >= 40:
        risk_level = "MEDIUM"
        message = "Voice requires additional verification."

    else:
        risk_level = "LOW"
        message = "Voice appears likely to be human."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "message": message
    }