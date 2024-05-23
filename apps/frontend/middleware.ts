export {auth as middleware} from 'auth';
// export const config ={
//     match: ["daily-tasks"]
// }
// import { auth } from "auth";
// export default auth((req)=>{
//   let session = auth()
//   console.log(session)
//   let isLoggedIn = !!req.auth
//   console.log({isLoggedIn})
//   console.log("Route from middleware.ts",req.nextUrl.pathname)
// })
// // export default auth((req) => {
// //   const { nextUrl } = req;
// //   const isLoggedIn = !!req.auth;

// //   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
// //   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
// //   const isAuthRoute = authRoutes.includes(nextUrl.pathname);

// //   if (isApiAuthRoute) {
// //     return null;
// //   }

// //   if (isAuthRoute) {
// //     if (isLoggedIn) {
// //       return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
// //     }
// //     return null;
// //   }

// //   if (!isLoggedIn && !isPublicRoute) {
// //     let callbackUrl = nextUrl.pathname;
// //     if (nextUrl.search) {
// //       callbackUrl += nextUrl.search;
// //     }

// //     const encodedCallbackUrl = encodeURIComponent(callbackUrl);

// //     return Response.redirect(new URL(
// //       `/auth/login?callbackUrl=${encodedCallbackUrl}`,
// //       nextUrl
// //     ));
// //   }

// //   return null;
// // })

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}