import {PrismaClient} from '@prisma/client';
import sampleData from './sample-data';

async function main() {
    const prisma = new PrismaClient();
    await prisma.$connect();

    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();

    await prisma.product.createMany({data: sampleData.products});
    await prisma.user.createMany({data: sampleData.users});
    
    await prisma.$disconnect();
    console.log('Productos cargados');
    console.log('users cargados');
}

main();