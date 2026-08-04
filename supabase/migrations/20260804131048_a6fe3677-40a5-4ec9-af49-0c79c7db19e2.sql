CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_hi text NOT NULL,
  title_en text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'FileText',
  official_url text,
  category text NOT NULL DEFAULT 'अन्य',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read schemes" ON public.schemes FOR SELECT TO anon, authenticated USING (is_published OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage schemes" ON public.schemes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.scheme_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id uuid NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  label text NOT NULL,
  url text NOT NULL,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scheme_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheme_links TO authenticated;
GRANT ALL ON public.scheme_links TO service_role;
ALTER TABLE public.scheme_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read links" ON public.scheme_links FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.schemes s WHERE s.id = scheme_id AND (s.is_published OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "admins manage links" ON public.scheme_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER schemes_updated_at BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.schemes (slug, title_hi, title_en, description, icon, official_url, category, sort_order) VALUES
('aadhar','आधार कार्ड','Aadhaar Card','UIDAI से जुड़े सभी काम — डाउनलोड, अपडेट, स्टेटस और PVC कार्ड।','IdCard','https://uidai.gov.in/','पहचान',0),
('pan-card','पैन कार्ड','PAN Card','नया पैन, e-PAN डाउनलोड, आधार लिंक और सुधार।','CreditCard','https://www.incometax.gov.in/','पहचान',1),
('pm-kisan','पीएम किसान सम्मान निधि','PM Kisan Samman Nidhi','किसानों के लिए ₹6000/वर्ष — e-KYC, स्टेटस और लाभार्थी सूची।','Sprout','https://pmkisan.gov.in/','किसान',2),
('voter-id-card','वोटर आईडी कार्ड','Voter ID Card','नया वोटर कार्ड, EPIC डाउनलोड और लिस्ट में नाम चेक।','Vote','https://voters.eci.gov.in/','पहचान',3),
('my-lpg-gas','LPG गैस सेवाएँ','MY LPG Gas','Indane, HP और Bharat Gas की सभी ऑनलाइन सेवाएँ।','Flame','https://mylpg.in/','गैस',4),
('pm-ujjwala-yojana','पीएम उज्ज्वला योजना','PM Ujjwala Yojana','मुफ्त गैस कनेक्शन योजना के आवेदन और जानकारी।','Flame','https://www.pmuy.gov.in/','गैस',5),
('pmuy-lpg-gas-ekyc','उज्ज्वला LPG e-KYC','PMUY LPG eKYC','गैस कनेक्शन की e-KYC ऐप और प्रक्रिया।','ScanFace','https://www.pmuy.gov.in/','गैस',6),
('pm-awas-yojana','पीएम आवास योजना','PM Awas Yojana','ग्रामीण व शहरी आवास योजना — आवेदन, लिस्ट और ट्रैकिंग।','Home','https://pmayg.nic.in/','आवास',7),
('ration-card','राशन कार्ड','Ration Card','नया राशन कार्ड, डाउनलोड और सभी राज्यों के पोर्टल।','ShoppingBasket','https://nfsa.gov.in/','राशन',8),
('e-shram-card','ई-श्रम कार्ड','e-Shram Card','असंगठित श्रमिकों का रजिस्ट्रेशन, डाउनलोड और मानधन।','HardHat','https://eshram.gov.in/','श्रमिक',9),
('ayushman-card','आयुष्मान भारत कार्ड','Ayushman Card','₹5 लाख तक मुफ्त इलाज — कार्ड बनाएँ, डाउनलोड और लिस्ट।','HeartPulse','https://beneficiary.nha.gov.in/','स्वास्थ्य',10),
('bhu-naksha','भू-नक्शा व भूलेख','Bhu Naksha & Land Records','सभी राज्यों के जमीन के नक्शे और भूलेख पोर्टल।','Map','https://bhunaksha.nic.in/','जमीन',11),
('pf-epfo','PF / EPFO सेवाएँ','PF & EPFO Services','PF बैलेंस, पासबुक, KYC, क्लेम और UAN से जुड़े काम।','PiggyBank','https://www.epfindia.gov.in/','रोजगार',12),
('sanchar-saathi','संचार साथी (मोबाइल)','Sanchar Saathi','सिम चेक, चोरी हुआ मोबाइल ब्लॉक/अनब्लॉक करें।','Smartphone','https://sancharsaathi.gov.in/','मोबाइल',13);

INSERT INTO public.scheme_links (scheme_id, label, url, sort_order)
SELECT s.id, v.label, v.url, v.ord FROM public.schemes s JOIN (VALUES
('aadhar','आधार वैलिडिटी चेक करें','https://myaadhaar.uidai.gov.in/',0),
('aadhar','आधार Document Update करें','https://myaadhaar.uidai.gov.in/',1),
('aadhar','अपॉइंटमेंट बुक करे','https://appointments.uidai.gov.in/',2),
('aadhar','आधार कार्ड डाउनलोड करे','https://myaadhaar.uidai.gov.in/',3),
('aadhar','मोबाइल नंबर या ईमेल वैरीफाइ करे','https://myaadhaar.uidai.gov.in/',4),
('aadhar','PVC आधार कार्ड आर्डर करे','https://myaadhaar.uidai.gov.in/',5),
('aadhar','PVC आधार कार्ड का आर्डर स्टेटस जाने','https://myaadhaar.uidai.gov.in/',6),
('aadhar','आधार कार्ड का स्टेटस चेक करे','https://myaadhaar.uidai.gov.in/',7),
('aadhar','आधार कार्ड में पता बदले','https://myaadhaar.uidai.gov.in/',8),
('aadhar','आधार कार्ड में संशोधन करे','https://myaadhaar.uidai.gov.in/',9),
('aadhar','आधार में जुड़े मोबाइल नंबर चेक करे','https://myaadhaar.uidai.gov.in/',10),
('aadhar','आधार कार्ड का नंबर जाने','https://myaadhaar.uidai.gov.in/',11),
('aadhar','Aadhar Authentication History देखें','https://myaadhaar.uidai.gov.in/',12),
('aadhar','नाम और मोबाइल नंबर से आधार कार्ड नंबर जाने','https://myaadhaar.uidai.gov.in/',13),
('aadhar','नजदीकी आधार सेंटर जाने','https://bhuvan-app3.nrsc.gov.in/',14),
('aadhar','ऑफिसियल वेबसाइट','https://uidai.gov.in/',15),
('pan-card','नया पैनकार्ड बनाये','https://www.pan.utiitsl.com/',0),
('pan-card','पैनकार्ड ट्रैक करे','https://www.trackpan.utiitsl.com/',1),
('pan-card','e-PAN डाउनलोड करे','https://pan.utiitsl.com/',2),
('pan-card','पैनकार्ड पुनः प्रिंट करे','https://www.pan.utiitsl.com/',3),
('pan-card','फ्री में पैनकार्ड बनाये (Instant PAN)','https://eportal.incometax.gov.in/',4),
('pan-card','Instant PAN स्टेटस चेक करे','https://www.trackpan.utiitsl.com/',5),
('pan-card','Instant PAN डाउनलोड करे','https://eportal.incometax.gov.in/',6),
('pan-card','आधार कार्ड लिंक करे','https://eportal.incometax.gov.in/',7),
('pan-card','माइनर पैनकार्ड बनाये (18 से कम)','https://www.onlineservices.nsdl.com/',8),
('pan-card','आधार लिंक का स्टेटस चेक करे','https://eportal.incometax.gov.in/',9),
('pan-card','पैनकार्ड में संशोधन करे','https://www.pan.utiitsl.com/',10),
('pm-kisan','e-KYC करे','https://pmkisan.gov.in/',0),
('pm-kisan','e-KYC हुआ की नहीं जाने','https://pmkisan.gov.in/',1),
('pm-kisan','नए किसान का रजिस्ट्रेशन','https://pmkisan.gov.in/',2),
('pm-kisan','सेल्फ रजिस्टर्ड किसान का स्टेटस /CSC','https://pmkisan.gov.in/',3),
('pm-kisan','सेल्फ रजिस्टर्ड किसान का अपडेट','https://pmkisan.gov.in/',4),
('pm-kisan','अपना स्टेटस चेक करे','https://pmkisan.gov.in/',5),
('pm-kisan','रजिस्ट्रेशन नंबर जाने','https://pmkisan.gov.in/',6),
('pm-kisan','मोबाइल नंबर अपडेट करे','https://pmkisan.gov.in/',7),
('pm-kisan','नाम में सुधार करे','https://pmkisan.gov.in/',8),
('pm-kisan','नई लाभार्थी सूची देखे','https://pmkisan.gov.in/',9),
('pm-kisan','किश्त का स्टेटस देखे','https://pmkisan.gov.in/',10),
('pm-kisan','PM Kisan App डाउनलोड करे','https://play.google.com/',11),
('pm-kisan','ऑफिसियल वेबसाइट','https://pmkisan.gov.in/',12),
('voter-id-card','न्यू वोटर कार्ड रजिस्ट्रेशन','https://voters.eci.gov.in/',0),
('voter-id-card','Voter Card (EPIC) डाउनलोड करें','https://voters.eci.gov.in/',1),
('voter-id-card','Voter List में नाम चेक करें','https://electoralsearch.eci.gov.in/',2),
('voter-id-card','आवेदन स्टेटस चेक करें','https://voters.eci.gov.in/',3),
('voter-id-card','वोटर कार्ड नंबर जानें','https://electoralsearch.eci.gov.in/',4),
('voter-id-card','वोटर कार्ड लॉग इन','https://voters.eci.gov.in/',5),
('voter-id-card','वोटर कार्ड में गलती सुधारें','https://voters.eci.gov.in/',6),
('my-lpg-gas','Indane Gas','https://cx.indianoil.in/',0),
('my-lpg-gas','Indane — Know your LPG ID','https://cx.indianoil.in/',1),
('my-lpg-gas','HP Gas','https://myhpgas.in/',2),
('my-lpg-gas','HP — Know your LPG ID','https://myhpgas.in/',3),
('my-lpg-gas','Bharat Gas','https://my.ebharatgas.com/',4),
('my-lpg-gas','Bharat — Know your LPG ID','https://my.ebharatgas.com/',5),
('my-lpg-gas','ऑफिसियल वेबसाइट','https://www.pmuy.gov.in/',6),
('pm-ujjwala-yojana','Indane Gas','https://cx.indianoil.in/',0),
('pm-ujjwala-yojana','HP Gas','https://myhpgas.in/',1),
('pm-ujjwala-yojana','Bharat Gas','https://my.ebharatgas.com/',2),
('pm-ujjwala-yojana','ऑफिसियल वेबसाइट','https://www.pmuy.gov.in/',3),
('pmuy-lpg-gas-ekyc','e-KYC App (Android)','https://play.google.com/',0),
('pmuy-lpg-gas-ekyc','e-KYC App (iOS)','https://apps.apple.com/',1),
('pmuy-lpg-gas-ekyc','HP Gas e-KYC App','https://cx.indianoil.in/',2),
('pmuy-lpg-gas-ekyc','Bharat Gas e-KYC App','https://cx.indianoil.in/',3),
('pmuy-lpg-gas-ekyc','Aadhar Face RD App','https://cx.indianoil.in/',4),
('pmuy-lpg-gas-ekyc','ऑफिसियल वेबसाइट','https://www.pmuy.gov.in/',5),
('pm-awas-yojana','PM आवास की नई लिस्ट','https://rhreporting.nic.in/',0),
('pm-awas-yojana','IAY/PMAYG Beneficiary','https://awaassoft.nic.in/',1),
('pm-awas-yojana','FTO Tracking','https://awaassoft.nic.in/',2),
('pm-awas-yojana','शहरी आवास योजना 2.0 Apply','https://pmay-urban.gov.in/',3),
('pm-awas-yojana','स्कीम गाइडलाइन्स','https://pmaymis.gov.in/',4),
('pm-awas-yojana','आवेदन ट्रैक करें','https://pmaymis.gov.in/',5),
('pm-awas-yojana','Track Assessment Status','https://pmaymis.gov.in/',6),
('pm-awas-yojana','ऑफिसियल वेबसाइट','https://pmayg.dord.gov.in/',7),
('ration-card','नया राशन कार्ड आवेदन','https://nfsa.gov.in/',0),
('ration-card','आवेदक लॉग इन','https://nfsa.gov.in/',1),
('ration-card','Mera Ration App','https://play.google.com/',2),
('ration-card','राशन कार्ड Name Add Status चेक करें','https://nfsa.gov.in/',3),
('ration-card','राशन कार्ड से नाम कटा की नही देखें','https://nfsa.gov.in/',4),
('ration-card','राशन कार्ड डाउनलोड','https://play.google.com/',5),
('ration-card','फोटो वाला राशन कार्ड डाउनलोड','https://nfsa.gov.in/',6),
('ration-card','उत्तर प्रदेश','https://nfsa.up.gov.in/',7),
('ration-card','बिहार','https://epds.bihar.gov.in/',8),
('ration-card','राजस्थान','https://food.rajasthan.gov.in/',9),
('ration-card','मध्यप्रदेश','https://rationmitra.nic.in/',10),
('ration-card','हरियाणा','https://hr.epds.nic.in/',11),
('ration-card','उत्तराखंड','https://rcmspds.uk.gov.in/',12),
('ration-card','झारखण्ड','https://aahar.jharkhand.gov.in/',13),
('ration-card','छत्तीसगढ़','https://fcs.cg.gov.in/',14),
('ration-card','हिमाचल प्रदेश','https://epds.co.in/',15),
('ration-card','महाराष्ट्र','https://rcms.mahafood.gov.in/',16),
('ration-card','ओडिशा','https://pdsodisha.gov.in/',17),
('ration-card','दिल्ली','https://nfs.delhi.gov.in/',18),
('e-shram-card','नया ई-श्रम कार्ड बनायें','https://register.eshram.gov.in/',0),
('e-shram-card','eShram Card Download करें','https://register.eshram.gov.in/',1),
('e-shram-card','eShram Card Download (UAN Number)','https://register.eshram.gov.in/',2),
('e-shram-card','CSC Login करें','https://connect.csc.gov.in/',3),
('e-shram-card','मानधन (रु.3000)','https://maandhan.in/',4),
('e-shram-card','मानधन रिप्रिंट','https://maandhan.in/',5),
('e-shram-card','ई श्रम कार्ड ऑफिसियल','https://eshram.gov.in/',6),
('e-shram-card','मानधन ऑफिसियल वेबसाइट','https://maandhan.in/',7),
('ayushman-card','आयुष्मान कार्ड बनायें','https://beneficiary.nha.gov.in/',0),
('ayushman-card','आयुष्मान कार्ड डाउनलोड करें','https://beneficiary.nha.gov.in/',1),
('ayushman-card','आयुष्मान कार्ड स्टेटस चेक','https://beneficiary.nha.gov.in/',2),
('ayushman-card','आयुष्मान कार्ड लिस्ट देखें','https://beneficiary.nha.gov.in/',3),
('ayushman-card','आयुष्मान कार्ड में सदस्य जोड़ें','https://beneficiary.nha.gov.in/',4),
('ayushman-card','e-KYC करें','https://beneficiary.nha.gov.in/',5),
('ayushman-card','आधार लिंक करें','https://beneficiary.nha.gov.in/',6),
('ayushman-card','ऑफिसियल एप डाउनलोड करें','https://play.google.com/',7),
('bhu-naksha','उत्तर प्रदेश','https://upbhunaksha.gov.in/',0),
('bhu-naksha','बिहार','https://bhunaksha.bihar.gov.in/',1),
('bhu-naksha','बिहार ऑर्डर','https://dlrs.bihar.gov.in/',2),
('bhu-naksha','राजस्थान','https://bhunaksha.rajasthan.gov.in/',3),
('bhu-naksha','मध्यप्रदेश','https://mpbhulekh.gov.in/',4),
('bhu-naksha','हरियाणा','https://hsac.org.in/',5),
('bhu-naksha','उत्तराखंड','https://bhunaksha.uk.gov.in/',6),
('bhu-naksha','झारखण्ड','https://jharbhoomi.jharkhand.gov.in/',7),
('bhu-naksha','झारखण्ड भू-नक्शा','https://jharbhunaksha.jharkhand.gov.in/',8),
('bhu-naksha','छत्तीसगढ़','https://bhunaksha.cg.nic.in/',9),
('bhu-naksha','महाराष्ट्र','https://mahabhunakasha.mahabhumi.gov.in/',10),
('bhu-naksha','ओडिशा','https://bhunakshaodisha.nic.in/',11),
('bhu-naksha','पश्चिम बंगाल','https://banglarbhumi.gov.in/',12),
('bhu-naksha','दिल्ली (NCT)','https://gsdl.org.in/',13),
('bhu-naksha','गुजरात','https://anyror.gujarat.gov.in/',14),
('bhu-naksha','असम','https://bhunaksha.assam.gov.in/',15),
('bhu-naksha','अरुणाचल प्रदेश','https://eservice.arunachal.gov.in/',16),
('bhu-naksha','पंजाब','https://jamabandi.punjab.gov.in/',17),
('bhu-naksha','जम्मू कश्मीर','https://landrecords.jk.gov.in/',18),
('bhu-naksha','चंडीगढ़','https://revenue.chd.gov.in/',19),
('bhu-naksha','गोवा','https://dslr.goa.gov.in/',20),
('bhu-naksha','सिक्किम','https://www.sikkimlrdm.gov.in/',21),
('bhu-naksha','मणिपुर','https://louchapathap.nic.in/',22),
('bhu-naksha','मिजोरम','https://megrevenuedm.gov.in/',23),
('bhu-naksha','कर्नाटक','https://landrecords.karnataka.gov.in/',24),
('bhu-naksha','तेलंगाना','https://dharani.telangana.gov.in/',25),
('bhu-naksha','आँध्रप्रदेश','https://meebhoomi.ap.gov.in/',26),
('bhu-naksha','तमिलनाडु','https://eservices.tn.gov.in/',27),
('bhu-naksha','केरल','https://dslr.kerala.gov.in/',28),
('bhu-naksha','त्रिपुरा','https://jami.tripura.gov.in/',29),
('pf-epfo','Active PF','https://unifiedportal-mem.epfindia.gov.in/',0),
('pf-epfo','PF Account Login','https://unifiedportal-mem.epfindia.gov.in/',1),
('pf-epfo','अपना PF अकाउंट जानें','https://unifiedportal-mem.epfindia.gov.in/',2),
('pf-epfo','PF Passbook','https://passbook.epfindia.gov.in/',3),
('pf-epfo','PF Claim Status','https://passbook.epfindia.gov.in/',4),
('pf-epfo','PF KYC करें खुद से','https://unifiedportal-mem.epfindia.gov.in/',5),
('pf-epfo','KYC Status Check','https://unifiedportal-mem.epfindia.gov.in/',6),
('pf-epfo','PF निकालें','https://unifiedportal-mem.epfindia.gov.in/',7),
('pf-epfo','UAN नंबर पता करें','https://unifiedportal-mem.epfindia.gov.in/',8),
('pf-epfo','ऑफिसियल वेबसाइट','https://www.epfindia.gov.in/',9),
('sanchar-saathi','आपके नाम पर कितने सिम है','https://tafcop.sancharsaathi.gov.in/',0),
('sanchar-saathi','चोरी/गुम मोबाइल ब्लॉक करें','https://ceir.sancharsaathi.gov.in/',1),
('sanchar-saathi','मोबाइल मिलने पर अनब्लॉक करें','https://ceir.sancharsaathi.gov.in/',2),
('sanchar-saathi','CEIR Request Status देखें','https://ceir.sancharsaathi.gov.in/',3),
('sanchar-saathi','मोबाइल चोरी/डुप्लीकेट है या नहीं देखें','https://ceir.sancharsaathi.gov.in/',4),
('sanchar-saathi','ऑफिसियल वेबसाइट','https://sancharsaathi.gov.in/',5)
) AS v(slug,label,url,ord) ON s.slug = v.slug;