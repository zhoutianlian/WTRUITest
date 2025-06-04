import React from 'react';

const WTRVision: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 text-center bg-gradient-to-b from-[var(--color-background-primary)] to-[var(--color-background-secondary)]">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-[var(--color-accent-gold-highlight)] border-b border-[var(--color-accent-gold)] pb-3 inline-block">
        Our Vision
      </h2>
      <p className="text-lg sm:text-xl text-[var(--color-text-primary)] max-w-3xl mx-auto leading-relaxed">
        WTR empowers professional crypto traders and institutions with unparalleled data intelligence. We strive to be the indispensable platform for navigating the complexities of digital assets, transforming raw data into actionable insights, and fostering a future where financial decisions are made with clarity and precision.
      </p>
      {/* Optional: abstract visual element here later */}
    </section>
  );
};
export default WTRVision;
