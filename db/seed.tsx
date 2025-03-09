import {PrismaClient} from '@prisma/client';
import sampleData from './sample-data';

async function main() {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.product.deleteMany();
    await prisma.product.createMany({data: sampleData.products});
    await prisma.$disconnect();
    console.log('Productos cargados');
}

main();