export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: '#4D7CFF', borderRightColor: '#7B61FF' }}
          />
          <div
            className="absolute inset-1 rounded-full border border-transparent animate-spin"
            style={{ borderTopColor: '#00F0FF', animationDuration: '0.6s', animationDirection: 'reverse' }}
          />
        </div>
        <p className="text-[12px] text-white/25 font-medium tracking-widest uppercase">Loading</p>
      </div>
    </div>
  )
}
