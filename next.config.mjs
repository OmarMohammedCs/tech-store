/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
    root: 'C:\\Users\\Omar\\OneDrive\\Desktop\\com\\my-app' 
  },
   images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
      port: "",
      pathname: "/**",
    },
    
  ],
  domains: ["lh3.googleusercontent.com"], 
},

};

 

export default nextConfig