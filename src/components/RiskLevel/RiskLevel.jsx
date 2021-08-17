export default class RiskLevel {
  static LOW = 'low';
  static MEDIUM = 'medium';
  static HIGH = 'high';
  static VERY_HIGH = 'very-high';
  static SEVERE = 'severe';

  static values = () => {
    return [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH, RiskLevel.VERY_HIGH, RiskLevel.SEVERE];
  }

  static valueOf(value) {
    switch(value) {
      case 1:
        return RiskLevel.LOW;
      case 2:
        return RiskLevel.MEDIUM;
      case 3:
        return RiskLevel.HIGH;
      case 4:
        return RiskLevel.VERY_HIGH;
      case 5:
        return RiskLevel.SEVERE;
    }
  }
}
