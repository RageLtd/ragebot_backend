export const conditionValues = ["streamOnline", "streamOffline"];

export function getHumanConditionName(condition: string) {
  switch (condition) {
    case "streamOnline":
      return "Stream is live";
    case "streamOffline":
      return "Stream is not live";
    default:
      return "";
  }
}
