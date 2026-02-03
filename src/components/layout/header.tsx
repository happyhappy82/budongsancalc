'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Menu, X, ChevronDown } from 'lucide-react'
import { NAV_CATEGORIES } from '@/lib/constants/navigation'
import { Button } from '@/components/ui/button'

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
    setOpenCategory(null)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setOpenCategory(null)
  }

  const toggleCategory = (label: string) => {
    setOpenCategory((prev) => (prev === label ? null : label))
  }

  return (
    <header className="bg-gradient-brand sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-white flex items-center gap-2"
        >
          <Calculator className="size-5" />
          부동산 계산기
        </Link>

        <nav className="hidden md:flex gap-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            홈
          </Link>
          {NAV_CATEGORIES.map((category) => {
            const isActive = category.items.some(
              (item) => item.href === pathname
            )
            return (
              <div key={category.label} className="relative group">
                <button
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {category.label}
                  <ChevronDown className="size-3" />
                </button>
                <div className="absolute top-full left-0 pt-1 hidden group-hover:block z-50">
                  <div className="bg-white rounded-lg shadow-lg border border-border/60 py-1 min-w-[180px]">
                    {category.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === item.href
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-white hover:bg-white/10"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </div>

      {isMenuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-gradient-brand px-4 pb-3 pt-1 max-h-[70vh] overflow-y-auto">
          <Link
            href="/"
            onClick={closeMenu}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              pathname === '/'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            홈
          </Link>
          {NAV_CATEGORIES.map((category) => (
            <div key={category.label}>
              <button
                onClick={() => toggleCategory(category.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10"
              >
                {category.label}
                <ChevronDown
                  className={`size-4 transition-transform ${
                    openCategory === category.label ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openCategory === category.label && (
                <div className="ml-3 border-l border-white/20 pl-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`block px-3 py-1.5 rounded-md text-sm ${
                        pathname === item.href
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}
