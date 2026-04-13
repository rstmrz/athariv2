import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
	render() {
		return (
			<Html lang="fr" suppressHydrationWarning>
				<Head>
					<link
						rel="icon"
						href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23050508'/%3E%3Cpath fill='%23e8e8ec' d='M8 22V10h4l4 7 4-7h4v12h-3.5v-7.2L15.2 22h-1.4L11.5 14.8V22H8z'/%3E%3C/svg%3E"
					/>
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1, viewport-fit=cover"
					/>
					<meta name="theme-color" content="#050508" />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
					<link
						href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap"
						rel="stylesheet"
					/>
				</Head>
				<body style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
