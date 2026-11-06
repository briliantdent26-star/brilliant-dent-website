# PUNA

## 2026-11-06 — Terminet, WhatsApp, harta, vlerësimet

- Terminet ruhen në Supabase me klinikë, mjek, shërbim, datë dhe orar. Paneli i konfirmon ose i anulon.
- Email-i te briliantdent26@gmail.com dërgohet vetëm kur `SMTP_PASS` është vendosur. Pa të, termini ruhet dhe shfaqet te paneli.
- Butoni WhatsApp lexon numrin nga kontakti. Harta tregon Rruga Riza Goga, 94, Ferizaj dhe hap drejtimet.
- Vlerësimet shtohen nga paneli dhe shfaqen vetëm për klinikën ku janë caktuar. Nuk u shpikën komente pacientësh.

## 2026-11-06 — Vlerësime nga vizitorët, galeri, shërbime dentare

- Vizitori dërgon yje, emër ose anonim dhe tekst. Ruhet `pending` dhe nuk del publik derisa admini të shtypë Aprovo te Vlerësimet. Mesatarja shfaqet vetëm kur ka vlerësime të aprovuara.
- Galeria e secilës klinikë është masonry, me përshkrim në hover dhe lightbox që kalon majtas/djathtas. Në panel: ngarko, përshkrim, renditje, fshirje, foto dhe MP4.
- Stomatologjia ka 14 shërbime me ikonë dhe tekst në tri gjuhë. Estetika nuk u prek. Urgjenca është shkruar 24/7 siç u kërkua; orari i publikuar mbetet e hënë–e shtunë 09:00–20:00.
- U provua: dërgimi i vlerësimit mbetet pending dhe u fshi; lightbox kalon te fotoja tjetër; 14 shërbimet dalin te /dent.

## 2026-11-06 — Butonat e rrjeteve në fund të faqes

- Teksti i Instagram, Facebook, Faqja e klinikës dhe TikTok dilte brenda rrathëve 34px dhe mbivendosej. Tani janë butona të veçantë me ikonë dhe emër, në një rresht, pa mbivendosje. Në telefon kalojnë në rreshtin tjetër.
- U provua te /dent (ekran i gjerë dhe 390px) dhe te /estetike (vetëm Instagram).

## 2026-11-06 — Shërbime estetike, Rreth nesh, pamje e re

- Estetika ka 14 shërbime në Supabase (SQ/EN/DE), me ikonë, nga PRX-T33 te kujdesi i lëkurës. Tre rreshtat e vjetër u përditësuan, të tjerët u shtuan.
- Ballina ka seksionin Rreth nesh: historia e dhënë, numëruesit 15+, 14+, 50.000+, 99%, teknologjia, dhe dy biografitë. Burimi ka foton e vet. Vjollca s’ka foto në databazë, prandaj del monogrami VS, jo një foto e shpikur.
- Hero i plotë, nav prej xhami, Playfair dhe Inter, ngjyra navy/ar dhe krem/rose. Kartat ngrenë në hover. Seksionet hyjnë me scroll. Pa rrëshqitje horizontale te 320, 390, 768, 1024 dhe 1440.
- Nuk u prek paneli i adminit, terminet, vlerësimet, as foto të reja pacientësh. CSS/JS mbeten të lexueshme; fotot e galerisë ngarkohen lazy dhe janë WebP.

## 2026-11-06 — Remote git

- origin u ndërrua te https://github.com/briliantdent/brilliant-dent-website.git
- origin është https://github.com/briliantdent26-star/brilliant-dent-website.git. Hyrja si briliantdent26-star u pranua dhe main u dërgua. .env nuk u commit-ua.
- Railway projekti brave-dream, shërbimi exciting-enthusiasm, është i lidhur me GitHub main. Domeni tani shkon te porta 8080. Fotot mungonin sepse /api/content dështonte: çelësi Supabase mungonte, pastaj Node 20 s’ka WebSocket. Çelësi u vendos dhe Node u caktua 22.
- Shërbimet dhe stafi krijoheshin me klasën reveal pas animacionit, prandaj mbeteshin të padukshëm. Tani vëzhgohen pasi të vizatohen.
- Hero slider: mbulesa e errët dhe kutia lejla u hoqën. Ngjyra është ar për stomatologjinë dhe rozë e ngrohtë për estetikën, me pika dhe shigjeta. Fotot e LYKENS dhe fasada me tekst të ngjitur u zëvendësuan. Fotoja e vërtetë e recepsionit me Dr. Burimin mbeti.
- Fotoja e parë është përsëri fasada e Brilliant Dental Clinic. Te estetika e njëjta ndërtesë, me përshkrimin “Standard i ri në estetikën e fytyrës.” Titulli mbi foto është më i vogël në të dyja anët.
- Telefoni, tableti dhe ekrani i ngushtë: menuja hapet me buton, heroja hyn në një ekran pa u prerë butoni i terminit, WhatsApp nuk e mbulon. Në ballinë dyert qëndrojnë njëra mbi tjetrën nën 700px dhe krah për krah më gjerë. Përshkrimet e galerisë duken edhe pa mi.
- Titulli i hero-sliderit qëndron mbi një pllakë të errët, që shkronjat e bardha të lexohen mbi çdo foto, te stomatologjia dhe te estetika.

## 2026-11-06 — Frëngjishtja dhe SEO

- Gjuha FR u shtua pranë SQ, EN dhe DE. Zgjedhja ruhet te shfletuesi dhe shqipja mbetet e parazgjedhur. Tekstet e faqes janë te `public/translations.json`. Paneli i pronarit mbetet shqip dhe tani ka katër fusha për çdo tekst.
- 14 shërbimet dentare, 14 estetike, të dy profilet, orari, adresa dhe përshkrimet e galerisë kanë frëngjisht. Tekstet shqip, anglisht dhe gjermanisht mbetën. Arsimimi i Vjollcës mbeti “specializim në estetikën e fytyrës dhe të lëkurës”, pa shkollë të shtuar.
- /dent dhe /estetike kanë titujt e kërkuar, përshkrim, Open Graph, Twitter, canonical dhe JSON-LD me adresën, të dy telefonat, orarin e hënë–shtunë 09:00–20:00 dhe koordinatat 42.3702, 21.1553. sitemap.xml dhe robots.txt janë publikë. Paneli mbetet noindex. Përgjigjet e mëdha dërgohen të ngjeshura.
- U provua lokalisht: FR te /dent (14 shërbime), /estetike (14), ballina, profili i Vjollcës dhe menuja në 390px. Kthimi te SQ i rikthen tekstet shqip. Pa rrëshqitje horizontale.

## 2026-11-06 — Hero pa fletë mbi foto

- Pllaka e errët që mbulonte foton u hoq. Fotoja qëndron e lirë. Titulli dhe përshkrimi janë në një shirit poshtë fotos, me shkronja të bardha mbi fund të errët, që lexohen pa e mbyllur ndërtesën.
- Në sliderin e stomatologjisë, me radhë: fasada, kabineti i trajtimit, hapësira e pritjes. Fotot e mëparshme të atij slideri u zëvendësuan.
- Në telefon fotoja zë gjerësinë e ekranit dhe butonat qëndrojnë poshtë tekstit, pa u mbuluar nga WhatsApp. Në ekran të gjerë fotoja dhe shiriti hyjnë në një ekran.
- Fotoja e dytë është salla e mbledhjes. Të tria fotot mbushin kutinë, pa vija të zeza anash dhe pa fletë mbi foto.
- Ikona e telefonit është B e artë në rreth, mbi sfond krem. «Shtoje te ekrani kryesor» e vendos me emrin Brilliant.
