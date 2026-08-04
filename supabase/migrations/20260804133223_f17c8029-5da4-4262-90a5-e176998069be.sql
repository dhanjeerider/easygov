ALTER TABLE public.schemes ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_hi text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'सरकारी नौकरी',
  qualification text NOT NULL DEFAULT '',
  total_posts text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  fee text NOT NULL DEFAULT '',
  age_limit text NOT NULL DEFAULT '',
  last_date date,
  apply_url text,
  notification_url text,
  description text NOT NULL DEFAULT '',
  image_url text,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read jobs" ON public.jobs FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage jobs" ON public.jobs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  show_in_menu boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages" ON public.pages FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage pages" ON public.pages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pages (slug, title, content, show_in_menu, sort_order) VALUES
('about', 'हमारे बारे में', 'Sarkari Setu एक निजी सूचना पोर्टल है जो सरकारी योजनाओं, सेवाओं और भर्तियों के आधिकारिक लिंक एक ही जगह उपलब्ध कराता है। हम किसी सरकारी संस्था से संबद्ध नहीं हैं।', true, 1),
('contact', 'संपर्क करें', 'किसी भी सुझाव, सुधार या शिकायत के लिए हमें ईमेल करें। हम हर संदेश का जवाब देने की कोशिश करते हैं।', true, 2),
('privacy', 'प्राइवेसी पॉलिसी', 'हम आपकी कोई भी व्यक्तिगत जानकारी सर्वर पर सेव नहीं करते। टूल्स (सैलरी ट्रैकर, वर्क लॉग, लिस्ट बिल्डर) का सारा डेटा आपके अपने ब्राउज़र में ही सुरक्षित रहता है।', true, 3),
('disclaimer', 'अस्वीकरण', 'इस वेबसाइट पर दी गई सभी जानकारी केवल सूचना के उद्देश्य से है। आवेदन करने से पहले संबंधित विभाग की आधिकारिक वेबसाइट पर जानकारी अवश्य जाँच लें।', true, 4);