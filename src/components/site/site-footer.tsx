export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center">
        <p className="text-xs leading-relaxed text-muted-foreground">
          सभी लिंक संबंधित सरकारी विभागों की आधिकारिक वेबसाइटों के हैं। यह एक निजी सूचना पोर्टल है,
          किसी सरकारी संस्था से संबद्ध नहीं है।
        </p>
        <p className="mt-2 text-xs text-muted-foreground">© {new Date().getFullYear()} Sarkari Setu</p>
      </div>
    </footer>
  );
}
