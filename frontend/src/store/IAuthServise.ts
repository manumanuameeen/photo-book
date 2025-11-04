

export  interface AuthState{
    user:any;
    isAuthenticated:boolean;
    loading:boolean;
    login:(payload:{email:string;password:string})=>Promise<void>;
    logout:()=>Promise<void>;
    fetchUser :()=>Promise<void>
}

