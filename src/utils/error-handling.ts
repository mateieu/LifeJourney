import { useToast } from "@/components/ui/use-toast";

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function handleSupabaseError(error: any, customMessage: string = "An error occurred") {
  console.error(error);
  
  if (error?.code === "PGRST116") {
    return new ApiError("Authentication required. Please sign in.", 401);
  }
  
  if (error?.code === "42P01") {
    return new ApiError("Table not found. Database setup may be incomplete.", 500);
  }
  
  return new ApiError(customMessage, 500);
}

export function useErrorHandler() {
  const { toast } = useToast();
  
  return {
    handleError: (error: any, customMessage: string = "An error occurred") => {
      const apiError = handleSupabaseError(error, customMessage);
      
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
      
      return apiError;
    }
  };
} 