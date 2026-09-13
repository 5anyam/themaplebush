'use client';

import Link from 'next/link';
import type { FamilyAxis, FamilyMember, ProductFamily } from '../lib/woocommerceApi';

/**
 * Colour / size switcher for products grouped by the "Product Families" plugin.
 *
 * Each option is a separate product with its own page, so every swatch is a
 * real link to that sibling. Picking a value keeps the other options the same
 * where such a product exists, and otherwise jumps to the closest one.
 */

interface Target {
  member: FamilyMember;
  /** True when every other option stays as it is. */
  exact: boolean;
}

/** Distinct values the family's products actually use on an axis. */
function usedValues(axis: FamilyAxis, members: FamilyMember[]) {
  return new Set(members.map((m) => m.values[axis.id]).filter(Boolean));
}

export default function ProductFamilySelector({
  family,
  currentId,
}: {
  family: ProductFamily;
  currentId: number;
}) {
  const current = family.members.find((m) => m.id === currentId);
  if (!current || family.members.length < 2) return null;

  // An option only one value long ("One size" for everything) isn't a choice.
  const axes = family.axes.filter((axis) => usedValues(axis, family.members).size > 1);
  if (!axes.length) return null;

  /** Which product to open when `value` is picked on `axis`. */
  const targetFor = (axis: FamilyAxis, value: string): Target | null => {
    const candidates = family.members.filter((m) => m.values[axis.id] === value);
    if (!candidates.length) return null;

    const others = axes.filter((a) => a.id !== axis.id);
    let best = candidates[0];
    let bestScore = -1;

    for (const member of candidates) {
      // Two points per other option left unchanged; one for being in stock,
      // so stock only breaks ties and never outweighs keeping the size.
      let score = 0;
      for (const a of others) {
        if ((member.values[a.id] ?? '') === (current.values[a.id] ?? '')) score += 2;
      }
      if (member.stock_status !== 'outofstock') score += 1;
      if (score > bestScore) {
        best = member;
        bestScore = score;
      }
    }

    const exact = others.every((a) => (best.values[a.id] ?? '') === (current.values[a.id] ?? ''));
    return { member: best, exact };
  };

  return (
    <div className="space-y-5 py-5 border-y border-[#FFE9DD]">
      {axes.map((axis) => {
        const selectedValue = current.values[axis.id] ?? '';
        const isColour = axis.type === 'color';

        return (
          <div key={axis.id}>
            <p className="block text-xs font-semibold text-[#2A0A22]/70 mb-3 uppercase tracking-wider">
              {axis.name}
              {selectedValue && (
                <span className="ml-2 text-[#E11D74] normal-case font-normal tracking-normal">
                  — {selectedValue}
                </span>
              )}
            </p>

            <div className={`flex flex-wrap ${isColour ? 'gap-3' : 'gap-2.5'}`}>
              {axis.options.map((option) => {
                const selected = option.value === selectedValue;
                const target = selected ? { member: current, exact: true } : targetFor(axis, option.value);
                const outOfStock = target?.member.stock_status === 'outofstock';

                const hint = !target
                  ? `${option.value} — not available`
                  : !target.exact
                  ? `${option.value} — also changes the other options`
                  : outOfStock
                  ? `${option.value} — out of stock`
                  : option.value;

                const showSwatch = isColour && option.swatch;

                const face = showSwatch ? (
                  <span
                    className={`relative block w-9 h-9 rounded-full transition-all duration-200 ${
                      selected
                        ? 'ring-2 ring-offset-2 ring-[#E11D74]'
                        : 'ring-1 ring-[#2A0A22]/15 group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-[#E11D74]/50'
                    } ${!target || outOfStock ? 'opacity-45' : ''}`}
                    style={{ background: option.swatch }}
                  >
                    {(!target || outOfStock) && (
                      // Diagonal strike for unavailable colours.
                      <span
                        className="absolute inset-0 m-auto h-px w-[130%] -left-[15%] top-1/2 rotate-45"
                        style={{ background: '#2A0A22' }}
                        aria-hidden
                      />
                    )}
                  </span>
                ) : (
                  <span
                    className={`inline-block px-5 py-2.5 border-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      selected
                        ? 'bg-[#E11D74] text-white border-[#E11D74] shadow-md shadow-[#E11D74]/20'
                        : !target
                        ? 'bg-[#FFF6EF] text-[#2A0A22]/25 border-[#FFE9DD]/60 line-through'
                        : outOfStock
                        ? 'bg-white text-[#2A0A22]/40 border-[#FFE9DD] line-through group-hover:border-[#E11D74]/50'
                        : `bg-white text-[#2A0A22] border-[#FFE9DD] group-hover:border-[#E11D74] group-hover:text-[#E11D74] ${
                            target.exact ? '' : 'border-dashed'
                          }`
                    }`}
                  >
                    {option.value}
                  </span>
                );

                if (selected) {
                  return (
                    <span key={option.value} className="group" title={hint} aria-current="true">
                      {face}
                      {showSwatch && <span className="sr-only">{option.value} (selected)</span>}
                    </span>
                  );
                }

                if (!target) {
                  return (
                    <span key={option.value} className="group cursor-not-allowed" title={hint} aria-disabled="true">
                      {face}
                      {showSwatch && <span className="sr-only">{hint}</span>}
                    </span>
                  );
                }

                return (
                  // A real link to the sibling's own page: shareable, crawlable,
                  // and the back button returns to the previous option.
                  <Link
                    key={option.value}
                    href={`/product/${target.member.slug}`}
                    className="group rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D74]/50"
                    title={hint}
                    aria-label={`${axis.name}: ${hint}`}
                  >
                    {face}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
