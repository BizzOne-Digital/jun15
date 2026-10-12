export function Hero() {
  return (
    <section
      className="relative isolate min-h-[min(58dvh,480px)] w-full max-w-full overflow-hidden bg-[#f5f3ee] bg-cover bg-[position:80%_center] sm:min-h-[min(72vh,560px)] sm:bg-[position:85%_center] md:bg-right"
      style={{ backgroundImage: "url('/hero.jpg')" }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#f5f3ee]/98 via-[#f5f3ee]/92 to-[#f5f3ee]/55 sm:bg-gradient-to-r sm:from-[#f5f3ee]/97 sm:via-[#f5f3ee]/88 sm:to-[#f5f3ee]/15 md:sm:to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex h-full min-h-[min(58dvh,480px)] w-full max-w-6xl items-end px-4 pb-10 pt-8 sm:min-h-[min(72vh,560px)] sm:items-center sm:px-6 sm:py-16">
        <div className="w-full min-w-0 max-w-md sm:max-w-lg md:max-w-xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#2d5a47] sm:text-sm sm:tracking-[0.18em]">
            Hinton, Alberta · Chinese cuisine
          </p>
          <h1 className="mt-2 text-[1.65rem] font-bold leading-[1.15] text-[#1a3328] sm:mt-3 sm:text-4xl md:text-[2.75rem]">
            Royal Garden Restaurant
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[#3d4a44] sm:mt-4 sm:text-lg">
            Dim sum, sizzling plates, and family favourites — order online for
            pickup or delivery.
          </p>
          <ul className="mt-3 space-y-0.5 text-sm text-[#5c6b64] sm:mt-4 sm:space-y-1 sm:text-base">
            <li className="break-words">296 Smith St, Hinton</li>
            <li>
              <a href="tel:+17808651111" className="underline-offset-2 hover:underline">
                (780) 865-1111
              </a>
            </li>
          </ul>
          <a
            href="#menu"
            className="mt-5 inline-flex w-full min-h-[48px] items-center justify-center rounded-full bg-[#1e4d3a] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] hover:bg-[#163a2c] sm:mt-6 sm:w-auto sm:min-h-0"
          >
            Order now
          </a>
        </div>
      </div>
    </section>
  );
}
