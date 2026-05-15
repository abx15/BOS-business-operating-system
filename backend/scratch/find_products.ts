import { prisma } from '../src/config/db';

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { in: ['Tata Salt 1kg', 'Fortune Oil 1L'] } },
    select: { id: true, name: true, stockQty: true }
  });
  console.log(JSON.stringify(products, null, 2));
}

main();
