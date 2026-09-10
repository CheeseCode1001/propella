'use client'

import type { Icon as IconsaxIcon } from 'iconsax-reactjs'

/**
 * Renders an Iconsax glyph in its outlined or filled form.
 *
 * Iconsax ships every icon as one component with a `variant` prop, so the
 * active/inactive pair in the sidebar and tab bar is a prop change rather than
 * two separate imports.
 */
export function NavIcon({
  icon: Icon,
  active,
  size = 22,
  color = 'currentColor',
}: {
  icon: IconsaxIcon
  active: boolean
  size?: number
  color?: string
}) {
  return <Icon size={size} color={color} variant={active ? 'Bold' : 'Linear'} />
}
