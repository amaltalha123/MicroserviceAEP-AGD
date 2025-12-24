import prisma from './config/database';
async function testConnection() {
 try {
 const employees = await prisma.employees.findMany({
 take: 6,
 });
 console.log('Connexion DB réussie !');
 console.log(`Trouvé ${employees.length} employés`);
 console.log(employees);
 } catch (error) {
 console.error('❌ Erreur de connexion:', error);
 } finally {
 await prisma.$disconnect();
 }
}
testConnection();