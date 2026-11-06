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
