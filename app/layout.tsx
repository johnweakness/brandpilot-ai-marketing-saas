import type {Metadata} from "next";import "./globals.css";
// Vercel supplies this automatically for production social-preview URLs.
const siteUrl=process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:"http://localhost:3000";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:"BrandPilot â€” AI Marketing Assistant",description:"Turn one brand brief into on-brand social posts, emails, ads, product copy, landing pages, and more.",icons:{icon:"/favicon.svg"},openGraph:{title:"BrandPilot â€” AI Marketing Assistant",description:"From brand brief to campaign in minutes.",images:["/og.png"]},twitter:{card:"summary_large_image",title:"BrandPilot â€” AI Marketing Assistant",description:"From brand brief to campaign in minutes.",images:["/og.png"]}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}

