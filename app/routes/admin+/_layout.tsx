import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import CompanyLogo from "~/components/company-logo.tsx";
import Footer from "~/components/footer.tsx";
import { Icon } from "~/components/icon.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "~/components/ui/avatar.tsx";
import { Button } from "~/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      select: {
        email: true,
        firstName: true,
        fullName: true,
        id: true,
        imageUrl: true,
        lastName: true
      },
      where: { id: userId }
    });

    return json({ user });
  } catch (err) {
    throw new Response("User not found", { status: 404 });
  }
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 px-2 shadow-lg md:p-4">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-2/6">
            <CompanyLogo className="w-32 md:w-44" />
          </div>
          <div className="flex items-center md:w-2/6 md:items-center md:justify-center">
            <Link
              className="font-inter w-auto fill-current text-center text-2xl font-semibold text-brand-deep-purple md:text-3xl md:font-bold"
              to="/admin/dashboard"
            >
              Charity Activations
            </Link>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 rounded-full bg-brand-deep-purple">
                    <Avatar>
                      <AvatarImage src={user.imageUrl ?? undefined} />
                      <AvatarFallback>{`${user.firstName.charAt(
                        0
                      )}${user.lastName.charAt(0)}`}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Icon className="mr-2 h-4 w-4" name="log-out" />
                    <Link to="/admin/logout">Log out</Link>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>
      <main className="min-h-screen max-w-full bg-brand-deep-purple bg-[url('/assets/bg.svg')] bg-cover px-4 pb-8 pt-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
