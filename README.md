# CONTAINERIZATION-DEMO
## Ohjeet kontittamista varten:

1.	Docker install https://www.docker.com/get-started <- Asenna sekä docker desktop. Sen mukana saat käyttöösi kaikki tarvittavat työkalut.
2. Luo profiili Docker hubiin. Tämä on itsellesi lokaali, jonne docker tallentaa lataamasi imaget ja käyttämsi containerit. Tilaa on 80g.
2.	Lataa postgresin image seuraavalla komennolla:
```bash
docker pull postgres
```
3.	Tämän jälkeen voit käynnistää postgresql - tietokannan containerin seuraavalla komennolla:
```bash
$ docker run -d -p 5432:5432 --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword postgres
```
4.	Avaa docker desktopista clientti  TAI käytä komentoa:
```bash
docker exec -it <konttiID> /bin/sh
```
Imagessa on psql clientti asennettuna, joten kantaa voidaan käyttää sen kautta, mikäli siihen on tarve.
5.	Kantaan pääsee komennolla:
```bash
psql --username "postgres" --dbname "postgres"
```
6. Lisäksi kuberneteksen ajamiseen tarvitsee enabloida kubernetes docker desktopin kautta -> Asetukset -> Kubernetes -> "Enable Kubernetes" -> Apply.

Näin kubernetes luo koneellesi lokaalin clusterin, jossa kuberneteksen resursseja voi pyörittää. Clusteriin voit luoda resursseja kubectl-komentorivityökalun kautta.

7. Lataa kubectl osoitteesta: https://kubernetes.io/docs/tasks/tools/

Tämän jälkeen voit luoda yaml - tiedostoja ja viet ne clusteriisi seuraavalla komennolla:
```bash
kubectl apply -f <tiedosto>
```
Tarkista, että kubectl - työkalulla on oikea conteksti:

```bash
kubectl config get-contexts
```

## Komentoja kannalla leikkimiseen:
### Taulun luonti:
CREATE TABLE users (
  name            varchar(80),
  title           varchar(80)
);

### Arvojen luonti tauluun
```bash
INSERT INTO users VALUES ('Timoteus teme', 'God of teme');
```

Tämän jälkeen voimme tarkistaa, että arvo tuli tallennettua
```bash
SELECT * FROM users;
```

Ohjelman kautta voi tehdä edellä mainitut askeleet kantaan suoraan, mutta virhetilanteissa kannan rakennetta voi olla järkevä katsella.

## Backendin ajaminen
Mikäli sovelluskoodi ei maita voi myös käyttää muita työkaluja ja muuttaa se esim. restifyhin. Expressissä tosin se on helppoa myös automatisoida express-generatorin kautta.

Huolimatta mitä tekee täytyy node.js olla asennettuna, sillä käytämme noden omaa package manageria hoitamaan koodigeneroinnin.

Jos nodea ei sinulla vielä ole, lataa se osooitteesta:
https://nodejs.org/en/download/

Lataa githubista projekti omalle koneellesi, kloonaus helpointa.
Tämän jälkeen aja lokaalissa hakemistossasi komento:
```bash
npm install
```

Sen jälkeen voit ajaa projektin pystyyn (postgres täytyy olla käynnissä tai muuten sovellus kaatuu) komennolla:
```bash
npm start
```

## Backendin docker imagen luonti

Jos haluat ajaa node-sovelluksesi dockerissa, täytyy sinun muuttaa tietokantasi host-arvo (postgres_init.js - tiedostossa) muotoon '172.17.0.22'. Arvo 172.17.0.2 viittaa dockerin sisäiseen verkkoon, jonka kautta se osaa antaa oikealle palvelulle pyyntösi käsiteltäväksi. Tämän jälkeen voit buildata sovelluksen imagesi.

Muista antaa imagellesi nimi, muuten joudut käyttämään muissa komennoissa imagen sha:ta eli Secure hash algorithm - numerosarjaa! Tässä demossa kuberneteksen tiedostot yms käyttävät kaikki "demo-express" - nimistä imagea, joten se täytyy muuttaa myös deployment.yaml - tiedostossa sekä docker composea ajettaessa docker-compose.yml tiedostossa.

Dockerin imaget voi buildata niiden hakemistoista käsin komennolla:
```bash
docker build . -t <imagenHaluttuNimi>
```

Aja container pystyyn komennolla:
```bash
docker run -it -p 3000:3000 <imagenNimi>
```

### docker composen ajo
Docker composea ajetaan suoraan tästä hakemistosta käsin docker-compose.yml - tiedoston avulla.

Docker composen network toimii jälleen eri tavalla muihin palveluihin verrattuna. Tiedostossa on määritelty palvelut, jotka pystyvät yhteisen bridge-networkin kautta tunnistamaan toisensa. Täten host-arvo täytyy taas muuttaa postgres_init.js - tiedostossa arvoon "db". Tämän jälkeen dockerin nykyinen image on vanhentunut, joten se täytyy buildata uudelleen.

Aja jälleen komento:
```bash
docker build . -t <imagenHaluttuNimi>
```

Edelleen mikäli imagesi nimi on muu kuin demo-express, täytyy sinun muuttaa määritykset docker-compose.yml - tiedostossa.

Muista ennen composen ajoa sammutta postgres containerisi docker desktopista. Muuten docker valittaa, että haluamasi port on jo varattu. Kun olet sammuttanut containerin aja komento:
```bash
docker compose up
```

Odota, että palvelut menevät pystyyn. Voit seurata niitä helposti docker desktopin kautta.

## kubectl ajo (katso ohjeet kubectl - asennukseen ylempää)

Muuta ensin kantasi host-parametri 'localhost' - arvoon.

Seuraavaksi voit luoda deploymenttisi käyttäen deployment.yaml - tiedostoa. Siirry ensin oikeaan hakemistoon
```bash
cd k8s/
```
Varmista kuitenkin tätä ennen, että kontekstisi on docker-desktopissa ylläolevan ohjeistuksen mukaan:
```bash
kubectl config get-contexts
```

Tämän jälkeen voit luoda deploymentin seuraavalla komennolla:
```bash
kubectl apply -f deployment.yaml
```
Komento luo palvelusi lokaaliin klusteriin.
Exposaa palvelusi kuberneteksessä, jotta pääset siihen käsiksi seuraavalla komennolla:
```bash
kubectl expose deployment express-demo --type=LoadBalancer --name=node-express
```

## Oman backend-projektin luonti
Generoi projekti haluamaasi hakemistoon (jo tehty projektissa, mutta omaa projektia voi yrittää harjoitella pystyttämään):
```bash
mkdir <haluamasi dir nimi>
npx init -y (luo package.jsonin)
npm install express ps swagger-ui-express body-parser
```
Ylläolevassa koodipätkässä on tehty vain expressi projekti, ei käytetty express-generatoria.

Tämän jälkeen voi muokata suoraan package.jsonin scriptejä ja luoda itselleen index.js tai app.js -tiedoston, johon sisällyttää oman sovelluslogiikan.

Tämän jälkeen projektin voi ajaa komennolla
```bash
node index.js
```
