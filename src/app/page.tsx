export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Fair Game Price Index</h1>
        <p className="text-lg mb-8">
          Welcome to the Fair Game Price Index, where we revolutionize game reviews by replacing arbitrary scores with concrete "Fair Price" recommendations. Our goal is to help you make informed purchasing decisions, ensuring you get the most value for your money.
        </p>
        <p className="text-lg mb-8">
          No more vague 8/10 ratings. We tell you what a game is truly worth, whether it's a "Premium" experience, a "Budget" gem, or something you should "Wait-for-Sale."
        </p>
        <p className="text-lg">
          Explore our reviews to discover games that offer fair value, and never overpay again!
        </p>
        {/* TODO: Add featured reviews grid here later */}
      </main>
    </div>
  );
}
