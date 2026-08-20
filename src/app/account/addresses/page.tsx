import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AccountNav } from '@/components/account/account-nav';
import { AddressManager } from '@/components/account/address-manager';

export default async function AddressesPage() {
  const session = await getAuthSession();
  if (!session) redirect('/account/login');

  const addresses = await prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="section-padding py-12 grid md:grid-cols-[220px_1fr] gap-12">
      <AccountNav />
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-3xl mb-8">Saved Addresses</h1>
        <AddressManager initialAddresses={addresses as any} />
      </div>
    </div>
  );
}
