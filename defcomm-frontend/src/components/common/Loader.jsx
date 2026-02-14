const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#F8F3F0] z-50">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-4">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-[#014BAA] border-t-transparent rounded-full animate-spin"></div>
          {/* Inner Pulse */}
          <div className="absolute inset-4 bg-[#014BAA] rounded-full animate-pulse opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold text-[#000000] tracking-wider animate-pulse">
          DefComm
        </h1>
        <p className="mt-2 text-sm text-[#000000]/60 font-medium">Securing Connection...</p>
      </div>
    </div>
  );
};

export default Loader;