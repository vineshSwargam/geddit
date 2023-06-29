import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import SearchBar from './SearchBar'
import { UserAccountNav } from './UserAccountNav'
import { buttonVariants } from './ui/Button'

const Navbar = async () => {
  const session = await getServerSession(authOptions)
  return (
    <div className='fixed top-0 inset-x-0 h-fit bg-gray-100 border-b border-zinc-300 z-[10] py-2'>
      <div className='container max-w-7xl h-full mx-auto flex items-center justify-between gap-2'>
        <Link href='/' className='flex gap-1 items-center'>
          <Image
            src={'/assets/images/gedditFireLogo.png'}
            width={32}
            height={32}
            alt='Geddit Logo'
          />
          <p className='hidden text-red-600 text-base font-bold md:block'>geddit</p>
        </Link>
        <SearchBar />
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <Link href='/sign-in' className={buttonVariants()}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  )
}

export default Navbar
