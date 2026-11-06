-- Dental service texts. Applied once against the existing services table.
update public.services set
  icon = 'fa-solid fa-tooth',
  title = jsonb_build_object('sq', 'Implantologji dentare', 'en', 'Dental implantology', 'de', 'Zahnimplantologie'),
  description = jsonb_build_object(
    'sq', 'Implantet e gjeneratës së fundit, përfshirë sistemet Straumann dhe Nobel Biocare, planifikohen sipas kockës dhe buzëqeshjes. Skanimi 3D CBCT dhe kirurgjia e udhëzuar e bëjnë vendosjen më të saktë dhe më të qetë. Kur rasti e lejon, implanti ngarkohet menjëherë me një dhëmb të përkohshëm. Për harqe të plota përdoren protokollet All-on-4 dhe All-on-6, me proteza të mbështetura në implante.',
    'en', 'Latest-generation implants, including Straumann and Nobel Biocare, are planned around the bone and the smile. 3D CBCT scanning and guided surgery make placement more precise and calmer. When the case allows, the implant is loaded immediately with a temporary tooth. Full arches are restored with All-on-4 and All-on-6 protocols and implant-supported prosthetics.',
    'de', 'Implantate der neuesten Generation, darunter Straumann und Nobel Biocare, werden nach Knochen und Lächeln geplant. 3D-CBCT und geführte Chirurgie machen die Insertion genauer und ruhiger. Wenn der Fall es erlaubt, wird das Implantat sofort mit einem provisorischen Zahn belastet. Ganze Zahnbögen werden mit All-on-4 und All-on-6 sowie implantatgetragenem Zahnersatz versorgt.'
  ),
  sort_order = 1
where clinic = 'dent' and title->>'sq' ilike '%mplant%';

update public.services set
  icon = 'fa-solid fa-face-smile',
  title = jsonb_build_object('sq', 'Smile Design dhe estetikë dentare', 'en', 'Smile Design and dental aesthetics', 'de', 'Smile Design und Zahnästhetik'),
  description = jsonb_build_object(
    'sq', 'Smile Design dixhital planifikon formën, ngjyrën dhe përmasat e dhëmbëve para se të fillojë puna. Fasetat e porcelanit, bonding-u me kompozit dhe riformësimi i dhëmbëve bëhen me teknologji CAD/CAM. Qëllimi është një buzëqeshje e natyrshme, e qëndrueshme në dritë dhe në fotografi. Çdo hap shpjegohet, nga prova dixhitale te vendosja përfundimtare.',
    'en', 'Digital Smile Design plans the shape, color and proportions of the teeth before treatment starts. Porcelain veneers, composite bonding and tooth reshaping are made with CAD/CAM technology. The aim is a natural smile that stays convincing in daylight and in photographs. Each step is explained, from the digital preview to the final fit.',
    'de', 'Digital Smile Design plant Form, Farbe und Proportionen der Zähne vor Beginn der Behandlung. Porzellanveneers, Komposit-Bonding und Zahnformung entstehen mit CAD/CAM-Technologie. Ziel ist ein natürliches Lächeln, das bei Tageslicht und auf Fotos überzeugt. Jeder Schritt wird erklärt, von der digitalen Vorschau bis zur endgültigen Eingliederung.'
  ),
  sort_order = 2
where clinic = 'dent' and (title->>'sq' ilike '%smile%' or title->>'sq' ilike '%estetik%');

update public.services set
  icon = 'fa-solid fa-bolt',
  title = jsonb_build_object('sq', 'Laser Dentistry', 'en', 'Laser dentistry', 'de', 'Laserzahnheilkunde'),
  description = jsonb_build_object(
    'sq', 'Trajtimet me lazer Er:YAG dhe me lazer diodë përdoren për kavitete, konturim të gingivës dhe përshpejtim të zbardhimit. Kirurgjia e indeve të buta bëhet pa bisturi, me më pak gjakderdhje dhe me shërim më të qetë. Procedura planifikohet sipas indit dhe nuk zëvendëson diagnozën. Anestezia dhe energjia e lazerit zgjidhen për rastin, jo si recetë e njëjtë për të gjithë.',
    'en', 'Er:YAG and diode lasers are used for cavities, gum contouring and faster whitening. Soft-tissue surgery is done without a scalpel, with less bleeding and a calmer recovery. The procedure is planned for the tissue and does not replace a proper diagnosis. Laser energy and anesthesia are chosen for the case, not applied as one recipe for everyone.',
    'de', 'Er:YAG- und Diodenlaser werden für Karies, Zahnfleischkonturierung und schnellere Aufhellung eingesetzt. Weichgewebechirurgie erfolgt ohne Skalpell, mit weniger Blutung und ruhigerer Heilung. Der Eingriff wird für das Gewebe geplant und ersetzt keine gründliche Diagnose. Laserenergie und Betäubung werden für den Fall gewählt.'
  ),
  sort_order = 3
where clinic = 'dent' and title->>'sq' ilike '%laser%';

update public.services set
  icon = 'fa-solid fa-user-doctor',
  title = jsonb_build_object('sq', 'Kirurgji orale', 'en', 'Oral surgery', 'de', 'Oralchirurgie'),
  description = jsonb_build_object(
    'sq', 'Kirurgjia orale mbulon heqjen e dhëmbëve të pjekurisë, ekstraksionet kirurgjikale, graftin e kockës dhe ngritjen e sinusit. Hiqen edhe ciste, bëhet apikoektomia dhe frenektomia kur indi e kërkon. Planifikimi mbështetet në radiografi dixhitale dhe, kur duhet, në skanim 3D. Pas procedurës jepet udhëzim i qartë për dhimbjen, ushqimin dhe kontrollin.',
    'en', 'Oral surgery covers wisdom-tooth removal, surgical extractions, bone grafting and sinus lift. Cyst removal, apicoectomy and frenectomy are done when the tissue requires them. Planning uses digital radiographs and, when needed, a 3D scan. After the procedure you receive clear guidance on pain, food and the review visit.',
    'de', 'Die Oralchirurgie umfasst Weisheitszahnentfernung, chirurgische Extraktionen, Knochenaufbau und Sinuslift. Zystenentfernung, Wurzelspitzenresektion und Frenektomie erfolgen, wenn das Gewebe es verlangt. Die Planung stützt sich auf digitale Röntgenbilder und bei Bedarf auf einen 3D-Scan. Nach dem Eingriff gibt es klare Hinweise zu Schmerz, Essen und Kontrolle.'
  ),
  sort_order = 4
where clinic = 'dent' and title->>'sq' ilike '%irurgj%';

insert into public.services (clinic, icon, title, description, sort_order)
select 'dent', v.icon,
  jsonb_build_object('sq', v.sq, 'en', v.en, 'de', v.de),
  jsonb_build_object('sq', v.sqd, 'en', v.endesc, 'de', v.ded),
  v.sort_order::int
from (
  values
  (5, 'fa-solid fa-syringe', 'Endodonti', 'Endodontics', 'Endodontie',
    'Trajtimi i kanalit bëhet me instrumente rrotulluese NiTi dhe me apex locator, që gjatësia e punës të matet me saktësi. Mikroskopi përdoret kur anatomia e kanalit është e ngushtë ose e fshehur. Ritrajtohen edhe kanalet që kanë dështuar më parë. Qëllimi është të ruhet dhëmbi, të hiqet infeksioni dhe të mbyllet kanali në mënyrë të qëndrueshme.',
    'Root canal treatment uses rotary NiTi instruments and an apex locator so the working length is measured precisely. A microscope is used when the canal anatomy is narrow or hidden. Canals that failed earlier can be retreated. The aim is to keep the tooth, clear the infection and seal the canal in a stable way.',
    'Die Wurzelbehandlung nutzt rotierende NiTi-Instrumente und einen Apexlocator, damit die Arbeitslänge genau gemessen wird. Ein Mikroskop kommt zum Einsatz, wenn die Kanäle eng oder verborgen sind. Bereits fehlgeschlagene Behandlungen können wiederholt werden. Ziel ist es, den Zahn zu erhalten, die Infektion zu entfernen und den Kanal stabil zu verschließen.'),
  (6, 'fa-solid fa-crown', 'Protetikë dentare', 'Dental prosthetics', 'Zahnersatz',
    'Kurorat e porcelanit në zirkon dhe e.max, urat dhe protezat e lëvizshme bëhen sipas kafshimit dhe ngjyrës së dhëmbëve fqinjë. Protezat mbi implante dhe atashmentet e precizionit përdoren kur duhet më shumë qëndrueshmëri. Përshtypjet dixhitale ndihmojnë që puna e laboratorit të ulet saktë. Prova bëhet para cementimit, që kontakti dhe estetika të rregullohen.',
    'Zirconia and e.max porcelain crowns, bridges and removable dentures are made to the bite and to the neighboring teeth. Implant-supported prosthetics and precision attachments are used when more stability is needed. Digital impressions help the laboratory work seat accurately. A try-in is done before cementation so the contact and the look can still be adjusted.',
    'Kronen aus Zirkon und e.max, Brücken und herausnehmbarer Zahnersatz werden nach Biss und Nachbarzähnen angefertigt. Implantatgetragener Zahnersatz und Präzisionsgeschiebe kommen zum Einsatz, wenn mehr Halt nötig ist. Digitale Abformungen helfen, dass die Laborarbeit genau sitzt. Vor dem Zementieren gibt es eine Einprobe.'),
  (7, 'fa-solid fa-teeth', 'Ortodonti', 'Orthodontics', 'Kieferorthopädie',
    'Ortodoncia korrigjon pozicionin e dhëmbëve dhe kafshimin te të rinjtë dhe te të rriturit. Ofrohen alignerë të tejdukshëm Invisalign, aparate qeramike dhe aparate metalike klasike. Pas trajtimit vendosen retainer-a që rezultati të mos kthehet. Plani fillon me analiza dhe me një shpjegim të kohëzgjatjes, jo me një aparat të zgjedhur pa diagnozë.',
    'Orthodontics corrects tooth position and the bite for younger and adult patients. Clear Invisalign aligners, ceramic braces and traditional metal braces are available. After treatment, retainers keep the result from drifting back. The plan starts with records and a clear explanation of the time involved.',
    'Die Kieferorthopädie korrigiert Zahnstellung und Biss bei Jugendlichen und Erwachsenen. Durchsichtige Invisalign-Aligner, keramische und klassische Metallspangen stehen zur Verfügung. Nach der Behandlung halten Retainer das Ergebnis. Der Plan beginnt mit Unterlagen und einer klaren Zeitangabe.'),
  (8, 'fa-solid fa-fill-drip', 'Stomatologji konservative', 'Conservative dentistry', 'Konservierende Zahnheilkunde',
    'Stomatologjia konservative ruan sa më shumë ind të shëndoshë të dhëmbit. Mbushjet me kompozit në ngjyrën e dhëmbit, inlay dhe onlay mbyllin kavitetin pa e zgjeruar pa nevojë. Preparimi minimal dhe izolimi i mirë e bëjnë ngjitjen më të qëndrueshme. Kontrolli pas punës siguron që kontakti i kafshimit të jetë i rehatshëm.',
    'Conservative dentistry keeps as much healthy tooth as possible. Tooth-colored composite fillings, inlays and onlays close the cavity without widening it without reason. Minimal preparation and careful isolation make the bond more durable. A check after treatment confirms that the bite feels comfortable.',
    'Die konservierende Zahnheilkunde erhält so viel gesunde Zahnsubstanz wie möglich. Zahnfarbene Kompositfüllungen, Inlays und Onlays schließen die Kavität, ohne sie unnötig zu erweitern. Minimale Präparation und sorgfältige Isolation machen die Haftung haltbarer. Eine Kontrolle danach prüft, ob der Biss angenehm ist.'),
  (9, 'fa-solid fa-heart-pulse', 'Periodontologji', 'Periodontics', 'Parodontologie',
    'Periodontologjia trajton gingivën e inflamuar dhe humbjen e mbështetjes së dhëmbit. Pastrimi i thellë, scaling dhe root planing, heq depozitat nën gingivë. Kur xhepi mbetet, bëhet kirurgji reduktuese, graft i gingivës ose terapi periodontale me lazer. Pa pastrim të rregullt në shtëpi, rezultati nuk mbahet.',
    'Periodontics treats inflamed gums and loss of tooth support. Deep cleaning, scaling and root planing, removes deposits under the gum. If the pocket remains, reduction surgery, gum grafting or laser periodontal therapy can follow. Without regular home cleaning, the result does not last.',
    'Die Parodontologie behandelt entzündetes Zahnfleisch und den Verlust der Zahnstützung. Die tiefe Reinigung entfernt Beläge unter dem Zahnfleisch. Bleibt die Tasche, können eine reduzierende Chirurgie, ein Zahnfleischtransplantat oder eine Lasertherapie folgen. Ohne regelmäßige Pflege zu Hause hält das Ergebnis nicht.'),
  (10, 'fa-solid fa-sun', 'Zbardhimi i dhëmbëve', 'Teeth whitening', 'Zahnaufhellung',
    'Zbardhimi profesional në klinikë bëhet me sisteme Zoom dhe Beyond, nën izolim të gingivës. Kompletet për shtëpi vazhdojnë rezultatin me një dozë të kontrolluar. Për dhëmbët e trajtuar me kanal bëhet zbardhim i brendshëm. Ngjyra e arritshme varet nga smalti dhe nga mbushjet, të cilat nuk zbardhen njësoj si dhëmbi.',
    'In-office whitening uses Zoom and Beyond systems, with the gums protected. Take-home kits continue the result at a controlled dose. Teeth already treated with a root canal can be whitened from the inside. The shade that can be reached depends on the enamel and on fillings, which do not lighten like the tooth.',
    'Die Aufhellung in der Klinik erfolgt mit Zoom und Beyond, bei geschütztem Zahnfleisch. Schienen für zu Hause führen das Ergebnis mit kontrollierter Dosis weiter. Bereits wurzelbehandelte Zähne können von innen aufgehellt werden. Die erreichbare Farbe hängt vom Schmelz und von Füllungen ab.'),
  (11, 'fa-solid fa-child', 'Stomatologji pediatrike', 'Pediatric dentistry', 'Kinderzahnheilkunde',
    'Stomatologjia për fëmijë fillon me një vizitë të qetë, pa nxitim dhe pa fjalë që trembin. Bëhen sealant parandalues, fluor dhe mbajtës hapsire kur një dhëmb qumështi humbet herët. Trajtimi shpjegohet edhe fëmijës, jo vetëm prindit. Qëllimi është një përvojë e butë dhe një zakon kontrolli që vazhdon.',
    'Children dentistry starts with a calm visit, without rush and without frightening language. Preventive sealants, fluoride and space maintainers are used when a baby tooth is lost early. The treatment is explained to the child as well as to the parent. The aim is a gentle experience and a habit of check-ups that continues.',
    'Die Kinderzahnheilkunde beginnt mit einem ruhigen Besuch, ohne Eile und ohne erschreckende Worte. Versiegelungen, Fluorid und Lückenhalter kommen zum Einsatz, wenn ein Milchzahn früh verloren geht. Die Behandlung wird dem Kind ebenso erklärt wie den Eltern. Ziel ist eine sanfte Erfahrung und eine Kontrolle, die zur Gewohnheit wird.'),
  (12, 'fa-solid fa-x-ray', 'Radiologji dentare dhe diagnostikë', 'Dental radiology and diagnosis', 'Dentale Radiologie und Diagnostik',
    'Diagnostika mbështetet në radiografi dixhitale panoramike dhe periapikale, me dozë të kontrolluar. Skanimi 3D CBCT përdoret kur implanti, kirurgjia ose kanali kërkon një pamje tredimensionale. Kamera intraorale tregon atë që syri në pasqyrë nuk e sheh qartë. Përshtypjet dixhitale zëvendësojnë materialin klasik kur rasti e lejon.',
    'Diagnosis uses digital panoramic and periapical radiographs, with a controlled dose. A 3D CBCT scan is used when an implant, surgery or a root canal needs a three-dimensional view. An intraoral camera shows what the mirror does not make clear. Digital impressions replace conventional material when the case allows it.',
    'Die Diagnostik nutzt digitale Panorama- und Zahnfilmaufnahmen mit kontrollierter Dosis. Ein 3D-CBCT wird eingesetzt, wenn Implantat, Chirurgie oder Wurzelkanal eine räumliche Ansicht brauchen. Eine Intraoralkamera zeigt, was der Spiegel nicht klar macht. Digitale Abformungen ersetzen klassisches Material, wenn der Fall es erlaubt.'),
  (13, 'fa-solid fa-truck-medical', 'Urgjenca stomatologjike', 'Dental emergency', 'Zahnärztlicher Notfall',
    'Dhimbja e fortë, dhëmbi i thyer, trauma dhe abscesi pranohen si urgjencë. Telefononi klinikën në çdo orë: linja është hapur 24 orë në ditë, shtatë ditë në javë. Së pari qetësohet dhimbja dhe stabilizohet dhëmbi, pastaj planifikohet trajtimi i plotë. Drenimi i abscesit dhe riparimi i thyerjes bëhen sapo rasti të vlerësohet.',
    'Severe pain, a broken tooth, trauma and an abscess are treated as emergencies. Call the clinic at any hour: the line is open 24 hours a day, seven days a week. Pain is settled and the tooth is stabilized first, then the full treatment is planned. Abscess drainage and repair of a fracture are done once the case has been assessed.',
    'Starke Schmerzen, ein gebrochener Zahn, Trauma und ein Abszess gelten als Notfall. Rufen Sie die Klinik zu jeder Stunde an: die Leitung ist 24 Stunden am Tag, sieben Tage die Woche erreichbar. Zuerst werden Schmerz und Zahn beruhigt, danach wird die vollständige Behandlung geplant.'),
  (14, 'fa-solid fa-shield-heart', 'Stomatologji parandaluese', 'Preventive dentistry', 'Prophylaxe',
    'Kontrollet e rregullta dhe pastrimi profesional heqin depozitat para se të bëhen kavitet ose problem i gingivës. Ju tregohet si të pastrohen zonat që furça e zakonshme i lë. Për sport bëhen mbrojtëse të përshtatura, dhe për shtypjen e dhëmbëve natën një gardh nate. Parandalimi është më i qetë se riparimi i një dhëmbi të dëmtuar.',
    'Regular check-ups and professional cleaning remove deposits before they become a cavity or a gum problem. You are shown how to clean the areas a usual brush misses. Custom mouthguards are made for sport, and a night guard for grinding. Prevention is calmer than repairing a tooth that has already been damaged.',
    'Regelmäßige Kontrollen und professionelle Reinigung entfernen Beläge, bevor Karies oder ein Zahnfleischproblem entsteht. Sie sehen, wie Stellen gereinigt werden, die die gewöhnliche Bürste auslässt. Für Sport werden individuelle Mundschutze angefertigt, für nächtliches Pressen eine Schiene. Vorbeugen ist ruhiger als die Reparatur eines bereits geschädigten Zahns.')
) as v(sort_order, icon, sq, en, de, sqd, endesc, ded)
where not exists (
  select 1 from public.services s
  where s.clinic = 'dent' and s.title->>'sq' = v.sq
);
