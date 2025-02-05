import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useState } from "react";
import API from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";

export function LoginForm({ className, ...props }) {
  const { logIn } = useContext(AuthContext);
  const [Matricule, setMatricule] = useState("");
  const [Password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/auth/login", {
        Matricule: Matricule,
        Password: Password,
      });

      if (response.data.success) {
        try {          
          const token = response.data.token;
          const decodedToken = jwtDecode(token);
          
          // Extract user data from the decoded token
          const userData = {
            token: token, 
            groupCode: decodedToken.groupCode, 
            roleCode: decodedToken.userRoleCode, 
            estateCode: decodedToken.estateCode
          }
          console.log("userdata", userData);

          // Store token and user data in localStorage      
          localStorage.setItem("token", token)    
          localStorage.setItem("groupCode", userData.groupCode);
          localStorage.setItem("roleCode", userData.roleCode);
          localStorage.setItem("estateCode", userData.estateCode);
          
          // Call to login function from AuthContext  
          logIn(userData)
          navigate("/dashboard");
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      console.log(response.data.token);
      localStorage.setItem("token", response.data.token);
      console.log(response.data);
    } catch (error) {
      setError(err.response?.error || "Login failed. Please try again.");
    }
  };
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center ">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your matricule below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="matricule">Matricule</Label>
          <Input
            id="matricule"
            type="text"
            placeholder="Matricule"
            value={Matricule}
            onChange={(e) => setMatricule(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline text-black hover:text-slate-500"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {error}
          </p>
        )}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"></div>
      </div>
      <div className="text-center text-sm">
        CDC Budget Application By ISD
      </div>
      <div className="text-center text-sm">{new Date().getFullYear()}</div>
    </form>
  );
}

export default LoginForm