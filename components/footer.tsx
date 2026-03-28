"use client";

import { Divider, Link } from "@heroui/react";

export default function SubscribeWithFooter() {
  return (
    <>

      <footer className="w-full bg-background border-t border-default-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            
          
            <div>
              <h2 className="text-xl font-bold">TechStore</h2>
              <p className="text-sm text-default-500 mt-2">
                Shop smart with modern eCommerce powered by Next.js
              </p>
            </div>

            
            <div className="flex gap-12">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/">Features</Link></li>
                  <li><Link href="/">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/">About</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <p className="text-center text-sm text-default-500">
            © {new Date().getFullYear()} TechStore. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
