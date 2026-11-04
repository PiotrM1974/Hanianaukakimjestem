# Małe kroki · Polski z Hanią

Gotowa, statyczna aplikacja do powtórki języka polskiego dla klasy 4. Nie wymaga instalowania pakietów, serwera aplikacji, kluczy API ani płatnych usług. Wersja 1.0, 4 listopada 2026 r.

## Najkrótsza instrukcja publikacji na GitHub Pages

1. Rozpakuj ZIP.
2. Utwórz repozytorium na swoim GitHubie, np. `hania-polski`. Dla bezpłatnego konta wybierz repozytorium publiczne. Nie dodawaj danych dziecka ani własnych haseł do plików.
3. Prześlij **zawartość folderu `hania-polski`** do głównego katalogu repozytorium. Plik `index.html` musi być bezpośrednio w katalogu głównym, nie w dodatkowym folderze. Przez stronę GitHuba: **Add file → Upload files → Commit changes**. Nie przesyłaj samego ZIP-a.
4. W repozytorium otwórz **Settings → Pages**.
5. W **Build and deployment → Source** wybierz **Deploy from a branch**.
6. Wybierz gałąź `main`, folder **/(root)** i kliknij **Save**. Jeśli Twoja gałąź nazywa się inaczej, wskaż jej nazwę.
7. Zaczekaj na zakończenie publikacji i otwórz adres pokazany przez GitHuba. Zwykle ma postać `https://TWOJ-LOGIN.github.io/hania-polski/`.

Instrukcja opiera się na [dokumentacji GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Repozytorium nie zostało utworzone ani opublikowane w ramach przygotowania tej paczki.

Minimalny komplet do publikacji:

```text
index.html
styles.css
content.js
core.js
visuals.js
app.js
sw.js
icon.svg
manifest.webmanifest
.nojekyll
```

Możesz wgrać cały folder wraz z dokumentacją i testami. Nie zawiera sekretów ani odpowiedzi konkretnego dziecka. Brak ukrytego pliku `.nojekyll` przy przesyłaniu przez przeglądarkę nie blokuje tej aplikacji: pozostałe pliki mają zwykłe nazwy i nie wymagają Jekylla.

## Korzystanie na iPadzie i iPhonie

Otwórz opublikowaną stronę w Safari. Możesz użyć **Udostępnij → Dodaj do ekranu początkowego**. Aplikacja nie wymaga konta. Nie blokuje powiększania tekstu; przyciski mają obszary dotykowe o wysokości co najmniej 44 px.

Przy pierwszym uruchomieniu potrzebny jest internet. Zaczekaj, aż stopka pokaże **„Gotowa do nauki bez internetu”**. Dopiero wtedy komplet podstawowych plików znajduje się w pamięci podręcznej. Przeglądarka lub system mogą tę pamięć później usunąć; wtedy potrzebne jest ponowne połączenie.

Syntezator mowy jest dodatkiem. Dostępność i jakość polskiego głosu zależą od systemu, przeglądarki i zainstalowanych głosów. Część głosów wymaga internetu. Aplikacja nie nagrywa głosu dziecka, nie korzysta z mikrofonu i nie wymaga czytania na głos do udzielenia odpowiedzi.

## Nauka

- Wybierz kategorię lub wszystkie tematy oraz 5, 10 albo wszystkie zagadnienia z wybranego zakresu.
- Poznaj wyjaśnienie i podpisany schemat.
- Kliknij „Rozumiem — sprawdzam pamięć”. Teoria znika, pojawia się polecenie samodzielnego przypomnienia.
- Potem przejdź do pytania. Kolejność odpowiedzi jest losowa.
- Błędna odpowiedź nie uruchamia odliczania. Wyjaśnienie pozostaje na ekranie, a temat trafia do powtórek.
- „Odkładam na koniec” przenosi temat do osobnej kolejki. Tematy z tej kolejki nie mogą być ponownie odkładane.
- Wynik odnosi się do danej sesji. Powtórki tworzą nową sesję. „Przećwiczone poprawnie” oznacza co najmniej jedną poprawną odpowiedź, a nie diagnozę opanowania materiału.

Szybki test losuje 15 różnych pytań z całej bazy, bez teorii przed odpowiedzią i bez limitu czasu. Biblioteczka pozwala czytać każdy temat bez rozpoczynania sesji.

## Zapis i prywatność

Postęp i bieżąca sesja są w `localStorage` tej przeglądarki, pod kluczami zaczynającymi się od `male-kroki-v1:`. Nie synchronizują się między urządzeniami. Po odświeżeniu wybierz „Kontynuuj”. Rozpoczęcie nowej sesji zastępuje poprzednią bieżącą sesję; ogólne postępy zostają.

Jeżeli zapis jest zablokowany, aplikacja informuje o tym i działa dalej bez trwałego zapisu. Wyczyszczenie danych strony i niektóre tryby prywatne usuwają postępy. Rodzic może je usunąć przez sekcję „Dla rodzica”.

Nie ma analityki, reklam, zewnętrznych obrazków, zewnętrznych czcionek ani formularzy danych osobowych. GitHub jako dostawca hostingu obsługuje dane techniczne połączenia. Syntezę mowy realizuje dostawca głosu systemowego; jego działanie i ewentualny dostęp do sieci zależą od urządzenia.

## Obrazki

Wszystkie 70 tematów ma własny **schemat edukacyjny SVG**, generowany z lokalnych danych. Nie są to fotografie. Są to podpisane układy liter, sylab, par wyrazów i pojęć, dobrane do treści. Nie ma linków do Wikimedia, pobierania obrazków ani ukrywania błędów przez `onerror`.

Schemat ma wariant szeroki i wąski, opis dla czytników ekranu oraz podpis. Legendarne postacie nie są przedstawiane za pomocą przypadkowych portretów; schematy nie udają map ani dokumentacji historycznej.

## Uruchomienie lokalne i testy

Do nauki używaj adresu GitHub Pages przez HTTPS. Na komputerze można też otworzyć `index.html` razem z pozostałymi plikami, ale obsługa adresów `file://` różni się między przeglądarkami, a service worker nie działa w tym trybie. Nie jest to zalecany sposób korzystania na iOS.

Testy nie wymagają pobierania zależności. Jeśli masz Node.js 20 lub nowszy, uruchom w folderze aplikacji:

```sh
node --test tests/*.test.cjs
```

Raport zawiera plik `RAPORT-SPRAWDZENIA.md`. Źródła i uwagi do treści znajdują się w `SOURCES.md`, a pełny spis tematów, kluczy odpowiedzi i podpisów ilustracji w `PRZEGLAD-TRESCI.md`.

## Aktualizowanie aplikacji

Po zmianie plików zwiększ oznaczenie `VERSION` w `sw.js` i prześlij pliki do repozytorium. Nowa wersja offline pobierze komplet plików, a następnie poczeka na zamknięcie starych kart aplikacji. Zamknij wszystkie jej karty i uruchom ponownie. Dzięki temu pliki dwóch wersji nie mieszają się w trakcie sesji. Postępy zostają, o ile nie zmieniono identyfikatorów tematów ani formatu zapisu.

## Zakres weryfikacji

To pomoc edukacyjna opracowana na podstawie przesłanego kodu i opisu zakresu. Nie otrzymano oryginalnego podręcznika ani jego podsumowania, dlatego nie potwierdzono zgodności strona po stronie z konkretnym wydaniem. Wersje legend mogą się różnić. Przed kartkówką warto porównać zakres z zeszytem i poleceniami nauczyciela.

Nie deklarujemy absolutnej bezawaryjności. Testy obejmują podane w raporcie scenariusze. Emulacja rozmiaru telefonu lub tabletu w przeglądarce nie jest testem na fizycznym iPhonie ani w Safari.
