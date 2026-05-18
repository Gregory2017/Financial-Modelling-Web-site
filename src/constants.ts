export interface Report {
  id: string;
  title: string;
  date: string;
  asset: string;
  summary: string;
  content: string;
  minPrice: string;
  maxPrice: string;
  currentPrice: string;
  volatility: string;
}

export const REPORTS: Report[] = [
  {
    id: "btc-usd-2026-04-30",
    title: "Technical Indicators BTC-USD",
    date: "2026-04-30",
    asset: "BTC-USD",
    summary: "Bitcoin remains the undisputed leader of the crypto market, showing strong power-law dynamics and positive correction dynamics in recent weeks.",
    content: `Bitcoin is undoubtful leader of the whole crypto market, and the market itself is in a strong power-law position, as the hill estimator is a= 2.6544 with potential extremes to be possible in various scenarios. Nevertheless, bitcoin is highly liquid and partially impacts the price change of other cryptocurrencies. It’s even impacting the price change of gold financial products, like PAXG or XAUG. The hill estimator of BTC-USD is a= 1.178 once again suggest power law to be active.

Considering technical indicators, of course we can see a plummet of price between 06.10.2025 and 30.04.2026, which is a crystal clear Bearish Trend. But in recent weeks we observe positive dynamics in price correction process. In particular, on 06.04.2026 the price; 68853.66 USD has crossed upwards SMA50;68647.56 USD and accelerates up till now, which is a Golden Crossing in action. Since 17.11.2025 SMA200 has been moving above SMA50 and regular price, at the moment SMA200 is 84228,58 USD.

Today on 30.04.2026 RSI is 54.99, which means strength index is well-balanced, neither overbought, nor oversold. MACD indicator, however, shows slight speed-down with signifier -251.73 nowadays.

In fact, bitcoin and ethereum are the two top-notch leaders of the crypto market in terms of liquidity. Annualised volatility of BTC-USD is 63.67 % with a min. price for the last 360 days 62702.10 USD and max. price 124752.53 USD, which means traders have good opportunities to make profit. Moreover, the current price is 76150,01 USD that is a perfect entry-points right in this moment.`,
    minPrice: "62,702.10 USD",
    maxPrice: "124,752.53 USD",
    currentPrice: "76,150.01 USD",
    volatility: "63.67%"
  },
  {
    id: "eth-usd-2026-05",
    title: "Technical Indicators ETH-USD",
    date: "2026-05-17",
    asset: "ETH-USD",
    summary: "ETH-USD shows positive dynamics with MACD speeding up and RSI suggesting it might be slightly overbought but signaling a buy trend.",
    content: `In recent years turbulent dynamics on crypto market has been observed by many experts; thus, macro and micro hill estimators, volatility rates suggest market to be in strong power-law state. In particular, hill estimator of the whole crypto market a = 2.6404 points out heavy tails, and as a consequence significant proportion of extremes in it. Being a part of it ETH-USD proves to be financially liquid as a financial product. 

To start with, hill estimator of ETH-USD a= 0.846 is proved to be in power-law, therefore, having more opportunities to gain by catching heavy tails, still needs careful risk management, such as leverage decisions, stop-loss, take-in reality check. On practice, the more investments you have for this pair, the more careful you need to be. 

Considering technical indicators, MACD is slightly bigger than the signal towards 2026.05 which means the trend is speeding up and has positive dynamics. In addition, RSI oscillator of ETH-USD for the last 360 days demonstrates signifier somewhere near 70 which proves it to be slightly overbought and can be a signal to buy. Overall, on the graphs it is clearly visible that recent close prices crosse SMA50 and EMA50, supporting the RSI and MACD signals for purchasing. 

The best entry-point is analysed through oscillators and historical price movements, but without taking into account the financial strategy for this pair, generally speaking it can be between the 1800-1900 usd because historical min. price is 1769 usd and historical max. price is 4831 usd; technical indicators suggest acceleration and signals to buy. Hence, this asset can be assessed as a liquid cause historically we can see positive dynamics in terms of price movement, moreover, during shocks it remained stable. Even when the price crossed the correction lines and fell into bearish trend it was not at inch close to default state. 

To summarise, ETH-USD is one of top players on power-law market of crypto currency, being also an accessible option proved to be financially liquid and perspective for gaining profit. However, the annualised volatility rate of this pair is 79, 4493% and apart from opportunities gives a clue to be more cautious when it comes about risk management.`,
    minPrice: "1,769 USD",
    maxPrice: "4,831 USD",
    currentPrice: "1,850 USD", // Estimated based on entry point text
    volatility: "79.45%"
  },
  {
    id: "sol-usd-2026-04-23",
    title: "Technical Indicators SOL-USD",
    date: "2026-04-23",
    asset: "SOL-USD",
    summary: "Solana is currently in a strong bearish trend with a 'Cross of Death' observed, requiring cautious risk management.",
    content: `To begin with, Solana- is a swift, high-producing blockchain technology of third generation with open source code. Being transparent, this financial asset proves to be both efficient and thus financially compelling for investors. High power capacity and low cost of transactions also contributes to its investing attractiveness.

However, technical indicators show that since 08.10.25 there has been a strong bearish trend, taking into account the general situation in the whole crypto market. On 23.11.2025 we can see that SMA 200: 179.70 usd crosses downward SMA 50:175.92 usd, which is a crystal clear Cross of Death. Moreover, RSI oscillator is 51.03 nowadays which means this financial product is neither overbought, nor oversold. MACD indicator is slightly bigger than the signal today on 23.04.2026 that suggests positive dynamics to accelerate.

The hill estimator of the whole crypto market is a= 2.6544, claiming a strong power-law state. At the same time, the hill estimator of pair SOL-USD is a= 1.183 that is even more power-law. Therefore, this financial product should be carefully managed in risk management section of analysis. Stop-loss is indispensable for huge investments in terms of this asset; Take-in might be a reasonable choice for operations if you do prefer active investment and strategies like scalping or swinging.

For the last 360 days the min. price of SOL-USD has been 77.75 usd, max. price 247.64 usd and mean price 148.29 usd with annualised volatility rate 111,70% and daily volatility 6.30 %.

Consequently, we can see a strong bearish trend for this asset in combination with intense power-law. Today the price for Solana is approximately 85,82 usd, which means it lost somewhere near 65.34% of its purchasing power, considering the max. price for the last 360 days and  up-to-date price. Therefore , Solana may be considered rather risky as liquidity of this asset is doubtful. Depending on macro and micro aspects of the whole crypto market and SOL-USD specifically, you can adjust your portfolio with this product but taking into account the level of risk with it. Actual price of this asset is the time lap  guarantee affordable before the potential default.`,
    minPrice: "77.75 USD",
    maxPrice: "247.64 USD",
    currentPrice: "85.82 USD",
    volatility: "111.70%"
  },
  {
    id: "ton-usd-2026-04-30",
    title: "Technical Indicators TON-USD",
    date: "2026-04-30",
    asset: "TON-USD",
    summary: " Depending on the macro and micro aspects of the cryptocurrency market, you may consider adjusting your portfolio with this product.",
    content: `To begin with, TON is a blockchain technology designed for high throughput and scalability within a decentralized ecosystem. The network's high capacity and low transaction fees are key factors that contribute to its overall investment attractiveness.  
However, technical indicators suggest that despite recent price gains, a broader bearish trend has dominated the market over the past year. The asset experienced a significant downturn from its yearly high of 3.60 USD, eventually bottoming out at 1.12 USD. As of May 5, 2026, the SMA 50 is recorded at 1.32 USD and the SMA 200 at 1.56 USD. Because the current price of 1.89 USD is trading above both of these moving averages, we are seeing a notable short-term recovery. Furthermore, the MACD indicator stands at 0.07, suggesting that positive momentum is currently accelerating in the short run.  
Despite this upward movement, the RSI oscillator has reached shocking figure of 85.08. This indicates that the financial product is heavily overbought, which serves as a clear warning that the current rally may be overextended and a technical correction could be imminent. Consequently, this asset should be handled with caution. Annualized volatility reaches approximately 48%, indicating the need for careful managment of large investments in this asset.
Over the last 360 days, the minimum price of TON was 1.12 USD, the maximum was 3.60 USD and the mean price sat at 3.34 USD. These figures highlight that although the current price of 1.89 USD is a strong bounce from the yearly low, the asset has still lost approximately 48 percent of its value compared to its yearly peak.  
In conclusion, we can observe a conflict between a strong short-term bullish recovery and a long-term bearish trend.
Considering technical indicators, of course we can see a plummet of price between 06.10.2025 and 30.04.2026, which is a crystal clear Bearish Trend. But in recent weeks we observe positive dynamics in price correction process. In particular, on 06.04.2026 the price; 68853.66 USD has crossed upwards SMA50;68647.56 USD and accelerates up till now, which is a Golden Crossing in action. Since 17.11.2025 SMA200 has been moving above SMA50 and regular price, at the moment SMA200 is 84228,58 USD.`,
    minPrice: "1.873 USD",
    maxPrice: "1.993 USD",
    currentPrice: "1.95 USD",
    volatility: "35.49%"
  }
];

export const PAGES_CONTENT = {
  methodology: {
    title: "Research Methodology",
    subtitle: "Mathematical Rigor in Market Analysis",
    content: "Our approach integrates classical technical analysis with advanced quantitative modelling. We specifically focus on Power-Law distributions, which characterize the frequency and magnitude of extreme price movements in high-volatility environments like crypto. By calculating the Hill Estimator (α), we quantify the 'heaviness' of market tails, allowing for superior risk assessment compared to standard Gaussian models."
  },
  contact: {
    title: "Get in Touch",
    subtitle: "Institutional Inquiries & Support",
    content: "For partnership opportunities, institutional API access, or technical support regarding our analysis tools, please reach out through our official channels. Our quantitative desk is available for deep-dive consultations on market dynamics and risk management strategies."
  },
  indicator_theory: {
    title: "Indicator Theory",
    subtitle: "Beyond Simple Moving Averages",
    content: "We utilize a hierarchy of indicators starting from trend-following SMAs (50, 200) to momentum oscillators like RSI and MACD. Our proprietary 'Golden Cross' and 'Death Cross' detection logic is enhanced by volume-weighting, ensuring that signals are backed by significant market liquidity. We treat RSI not just as an overbought/oversold gauge, but as a measure of relative strength against historical power-law extremes."
  },
  risk_assessment: {
    title: "Risk Assessment",
    subtitle: "Protecting Capital in Turbulent Markets",
    content: "Volatility is not just a risk; it's an opportunity quantification metric. Our annualized volatility calculations (reaching over 110% for assets like Solana) dictate our position-sizing recommendations. We advocate for strict Stop-Loss protocols based on calculated extreme-value theory (EVT) thresholds rather than arbitrary percentage drops."
  },
  api: {
    title: "Developer API",
    subtitle: "Low-Latency Data Streams",
    content: "Our REST and WebSocket APIs provide sub-second access to our quantitative indicators. Built for algorithmic traders, the API includes raw price data, calculated SMAs, real-time RSI values, and our proprietary Alpha-1 volatility score. Documentation is available for Python, TypeScript, and Go implementations."
  },
  desktop: {
    title: "Desktop App",
    subtitle: "Professional Trading Station",
    content: "The Stockholm Desktop Terminal offers the most comprehensive view of our data. Featuring multi-chart layouts, custom alert builders based on power-law extremes, and a direct bridge to our execution partners. Available for macOS, Windows, and Linux."
  },
  enterprise: {
    title: "Enterprise Solutions",
    subtitle: "Custom Analytics for Scale",
    content: "We provide bespoke analytical frameworks for hedge funds, family offices, and crypto-native treasuries. This includes custom risk dashboards, private API instances, and white-label versions of our technical analysis engine."
  }
};
