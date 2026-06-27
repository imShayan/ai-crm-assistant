import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/services/auth-service";

export function useAuth(){

     const router = useRouter();

    //state 
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    //function 
    async function checkAuth() {
        try {
          const user = await getCurrentUser();
    
          if (!user) {
            router.replace("/login");
            return false;
          }
    
          return true;
        } finally {
          setIsAuthLoading(false);
        }
      }

    return{
        isAuthLoading,
        checkAuth
    }
}