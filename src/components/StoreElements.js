'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SocialFloatingBar from './SocialFloatingBar';
import CartDrawer from './CartDrawer';

export default function StoreElements({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <SocialFloatingBar />}
      {!isAdmin && <CartDrawer />}
      <main>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
