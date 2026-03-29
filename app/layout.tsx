import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '空投墓地 AIRDROP GRAVEYARD',
  description: '收录那些空投后归零的加密项目。数据驱动，黑色幽默，警示后人。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}
