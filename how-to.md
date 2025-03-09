Para actualizar los models de prisma con la db

1 - hay q correr npx prisma generate
(asegurarse q la app no esté corriendo, sino tira error).

2 - npx prisma migrate dev --name "el nombre q quieras de la migracion"

3 - corremos npx prisma studio para abrir un front de la db (tipo phpmyadmin)

4 - No obligatorio: levantar el seed con unos articulos precargados.
npx tsx ./db/seed



