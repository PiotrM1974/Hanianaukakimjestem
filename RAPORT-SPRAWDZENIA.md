# Raport sprawdzenia · Małe kroki 1.1

Data: **7 listopada 2026 r.**

W wersji 1.1 dodano 31 tematów matematycznych i ręcznie przejrzano pytania, odpowiedzi oraz objaśnienia całej bazy 101 tematów. Testy automatyczne uruchomione po zmianie zakończyły się wynikiem 19/19. Testy sprawdzają strukturę i działanie aplikacji; same w sobie nie potwierdzają prawdziwości treści. Przegląd interfejsu w przeglądarce poniżej dotyczy wersji 1.0.


## Wynik

Gotowa paczka statyczna do umieszczenia w repozytorium GitHub i publikacji przez GitHub Pages. Bez zależności produkcyjnych i zewnętrznych ilustracji. **19 z 19 testów automatycznych zakończonych powodzeniem.** Przeprowadzono także kontrolę interfejsu w przeglądarce na lokalnym serwerze.

## Testy automatyczne

Uruchomienie: `node --test tests/*.test.cjs`, Node.js 24.22.1.

| Obszar | Wynik |
| --- | --- |
| 101 rekordów, unikalne identyfikatory i pytania, podział 20/25/15/10/31, prawidłowe indeksy i różne odpowiedzi | OK |
| Każdy temat ma kompletny schemat w dwóch wariantach, tytuł, opis dostępności i podpis | OK |
| Schematy nie zawierają zewnętrznych obrazów, skryptów ani zasobów | OK |
| Tasowanie bez gubienia elementów i bez zmiany wejściowej tablicy | OK |
| Jeden wers zajmuje jedną linijkę w schematach wers/strofa | OK |
| Pełna sesja 101 poprawnych odpowiedzi daje dokładnie 101/101 i kończy się | OK |
| Sesja 15 błędnych odpowiedzi daje 0/15 i kończy się | OK |
| Odłożenie wszystkich 101 pytań zwraca je raz; ponowne odkładanie zablokowane | OK |
| Mieszana kolejka: odpowiedzi poprawne, błędne i pominięcia zachowują mianownik | OK |
| Odtworzenie sesji na etapach teorii, przypominania, pytania i informacji zwrotnej | OK |
| Uszkodzone, niezgodne lub sprzeczne zapisy sesji odrzucane | OK |
| Uciekanie znaków HTML w schematach, zachowanie polskich liter | OK |
| Lokalne odnośniki istnieją; ścieżki względne zachowują podkatalog repozytorium | OK |
| Parsowanie wszystkich skryptów | OK |
| Start i podstawowa sesja przy zablokowanym localStorage | OK, test z atrapą DOM |
| Nieprawidłowy JSON postępów i sesji nie blokuje uruchomienia | OK, test z atrapą DOM |
| Brak Web Speech API nie blokuje przejścia do pytania | OK, test z atrapą DOM |
| Błąd syntezatora ma komunikat i nie blokuje nauki | OK, test z atrapą DOM |
| Drugie kliknięcie odpowiedzi nie nalicza dodatkowego wyniku | OK, test z atrapą DOM |
| Wznowienie interfejsu po odpowiedzi zachowuje stan blokady przycisków | OK, test z atrapą DOM |

Testy sprawdzają strukturę i zachowanie oprogramowania; nie dowodzą same w sobie poprawności merytorycznej. Materiał oceniono osobno redakcyjnie, z wykorzystaniem źródeł wskazanych w `SOURCES.md`.

## Weryfikacja w przeglądarce · wersja 1.0

Poniższy przegląd ekranu i schematów wykonano dla poprzedniego wydania z 70 tematami. Interfejs wersji 1.1 nie był ponownie sprawdzany w przeglądarce.

Użyto przeglądarki wbudowanej w aplikację komputerową. Sprawdzano adres z podkatalogiem `/hania-polski/`, odpowiadającym typowej lokalizacji projektu na GitHub Pages.

- Ekran główny: czytelny układ, cztery kategorie i przyciski startu.
- Szerokość **440 px**: otwarto wszystkie **70** tematów w biblioteczce; każdy wyświetlił widoczny wąski schemat. Brak poziomego przepełnienia strony i tekstu wychodzącego poza obszar SVG.
- Szerokość **820 px**: otwarto wszystkie **70** tematów; każdy wyświetlił szeroki schemat. Brak poziomego przepełnienia i tekstów szerszych niż przewidziane pole schematu.
- Ręczna inspekcja wizualna reprezentatywnych ekranów: strona główna, schemat rodziny Piasta na telefonie, schemat ortograficzny na tablecie.
- Nauka: wyświetlenie teorii, ukrycie jej w etapie przypominania, przejście do pytania, odpowiedź i informacja zwrotna.
- Odświeżenie strony po odpowiedzi: zapis zachowany, dostępne „Kontynuuj”, odpowiedzi nadal zablokowane, można przejść dalej.
- Test: przejście przez wszystkie **15** różnych pytań; po każdym kliknięciu blokada odpowiedzi, na końcu podsumowanie i lista zagadnień do powtórki.
- Powtórki: uruchomienie nauki z błędnie rozwiązanych zagadnień i odłożenie jednego na koniec.
- Biblioteczka: wyszukiwanie „skuwka” zwraca dwa właściwe tematy.
- Konsola sprawdzona po tych operacjach: brak zarejestrowanych błędów i ostrzeżeń aplikacji.
- **Próba offline:** po utworzeniu pełnej pamięci podręcznej zatrzymano lokalny serwer. Odświeżenie strony zadziałało, a wznowienie sesji wyświetliło teorię i schemat. Potwierdza to działanie aplikacji bez osiągalnego serwera dla tego scenariusza, nie obejmuje usunięcia pamięci przez system.

W czasie końcowej redakcji doprecyzowano definicję równoważnika zdania i poprawiono drobne etykiety wyniku. Skrócono też dwa autorskie wersy w schematach budowy wiersza, aby jeden wers zajmował dokładnie jedną linijkę. Testy automatyczne uruchomiono ponownie po tych korektach.

## Treść i dobór schematów

- Wersja 1.0: przejrzano 70 objaśnień, pytań, kluczy odpowiedzi i podpisów schematów. W audycie wersji 1.1 ręcznie przejrzano wszystkie 101 tematów.
- Usunięto przykład nieodpowiedni dla dziecka oraz błędne definicje i uogólnienia.
- Schematy pokazują pojęcia zgodne z treścią zamiast losowych zdjęć skojarzeniowych.
- Legendy opisano jako legendy; warianty opowieści nie są przedstawiane jako bezsporne fakty historyczne.
- Zalecenia bezpieczeństwa podkreślają udział zaufanego dorosłego, prywatność i długie unikalne hasła.
- Nie ma odliczania, zawstydzających komunikatów ani wymogu odpowiedzi do mikrofonu.

## Czego nie potwierdzono

- Działania na fizycznym iPadzie, iPhonie 16 Pro Max ani w Safari. Rozmiar okna w przeglądarce nie zastępuje tych testów.
- Jakości polskiej wymowy na konkretnym urządzeniu; to funkcja syntezatora systemowego.
- Zgodności strona po stronie z konkretnym wydaniem podręcznika, którego nie dostarczono.
- Formalnej recenzji nauczyciela ani badania użyteczności z Hanią.
- Publikacji na docelowym koncie GitHub — nie wskazano repozytorium. Pliki i instrukcja są gotowe do wgrania.
- Absolutnej bezawaryjności w każdych warunkach. Awaria hostingu, blokada JavaScript albo usunięcie pamięci podręcznej może wymagać ponownego połączenia lub poprawy ustawień.

## Szybki odbiór po publikacji

1. Otwórz adres GitHub Pages na docelowym urządzeniu.
2. Sprawdź jeden temat i schemat, przejdź do pytania i wybierz odpowiedź.
3. Odśwież stronę i użyj „Kontynuuj”.
4. Sprawdź polski głos przyciskiem „Posłuchaj wyjaśnienia”. Jeśli jest niedostępny, podstawowa nauka nadal działa.
5. Po komunikacie gotowości offline odłącz internet i ponownie otwórz aplikację.








## Audyt pytań i odpowiedzi

Ręcznie sprawdzono wszystkie 101 pytań, wskazane odpowiedzi i objaśnienia. Obliczenia w nowych zadaniach matematycznych przeliczono niezależnie. Informacje o zapisie egipskim, znakach Majów oraz nazwach miliard/bilion/biliard porównano z dodatkowymi źródłami wymienionymi w SOURCES.md. Poprawiono nadmiernie ogólne objaśnienie odejmowania w zapisie rzymskim i doprecyzowano funkcję litery i przed samogłoską. Automatyczne testy nie są dowodem prawdziwości treści; weryfikację merytoryczną przeprowadzono osobno.

