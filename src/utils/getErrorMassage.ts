export const getErrorMessage = (err: unknown, defaultMessage = "Something went wrong"): string => {
  const status = (err as { response?: { status?: number } })?.response?.status;

  switch (status) {
    case 404:
      return "File not found.";
    case 403:
      return "You don't have permission to delete this file.";
    default:
      return defaultMessage;
  }
};
