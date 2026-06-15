'use client';

import React, { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { toast } from '../hooks/use-toast';
import { Sparkles, MessageSquare, CheckCircle, ShoppingBag, PenLine, X } from 'lucide-react';

interface Review {
  id: number;
  date_created?: string;
  reviewer: string;
  reviewer_email?: string;
  review: string;
  rating: number;
  images?: string[];
}

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

interface ApiMetaItem {
  key: string;
  value: unknown;
}
interface ApiReview {
  id: number;
  date_created?: string;
  reviewer?: string;
  reviewer_email?: string;
  review?: string;
  rating?: number;
  meta_data?: ApiMetaItem[];
}

const isApiMetaItem = (m: unknown): m is ApiMetaItem =>
  typeof m === 'object' &&
  m !== null &&
  'key' in m &&
  'value' in m &&
  typeof (m as Record<string, unknown>).key === 'string';

const isApiReview = (r: unknown): r is ApiReview =>
  typeof r === 'object' &&
  r !== null &&
  typeof (r as Record<string, unknown>).id === 'number';

const stripHtml = (html: string): string => {
  if (!html) return '';
  const noP = html.replace(/<\/?p[^>]*>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
  const text = noP.replace(/<[^>]+>/g, '');
  return text.replace(/\n{3,}/g, '\n\n').trim();
};

// Rating bar widths for distribution display
const getRatingDistribution = (reviews: Review[]) => {
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const rounded = Math.round(r.rating);
    if (rounded >= 1 && rounded <= 5) dist[rounded]++;
  });
  return dist;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    reviewer: '',
    reviewer_email: '',
    review: '',
    rating: 0,
  });

  const API_BASE = 'https://cms.edaperfumes.com/wp-json/wc/v3';
  const CONSUMER_KEY = 'ck_b1a13e4236dd41ec9b8e6a1720a69397ddd12da6';
  const CONSUMER_SECRET = 'cs_d8439cfabc73ad5b9d82d1d3facea6711f24dfd1';

  useEffect(() => {
    if (productId) void loadReviews();
  }, [productId]);

  const parseImageUrlsFromMeta = (meta?: ApiMetaItem[]): string[] | undefined => {
    if (!Array.isArray(meta)) return undefined;
    const urlsItem = meta.find((m) => isApiMetaItem(m) && m.key === 'amraj_review_image_urls');
    if (!urlsItem) return undefined;
    const v = urlsItem.value;
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v as string[];
    return undefined;
  };

  const loadReviews = async (): Promise<void> => {
    try {
      setLoading(true);
      const url =
        `${API_BASE}/products/reviews?product=${productId}` +
        `&consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}` +
        `&per_page=100&status=approved`;
      const res = await fetch(url);
      if (!res.ok) { setReviews([]); return; }
      const data: unknown = await res.json();
      const list: ApiReview[] = Array.isArray(data) ? data.filter(isApiReview) : [];
      const mapped: Review[] = list.map((rev) => ({
        id: rev.id,
        reviewer: rev.reviewer ? String(rev.reviewer) : 'Anonymous',
        reviewer_email: rev.reviewer_email ? String(rev.reviewer_email) : undefined,
        review: stripHtml(rev.review ? String(rev.review) : ''),
        rating: typeof rev.rating === 'number' ? rev.rating : 0,
        date_created: rev.date_created ? String(rev.date_created) : undefined,
        images: parseImageUrlsFromMeta(rev.meta_data),
      }));
      setReviews(mapped);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.reviewer || !formData.review || formData.rating === 0) {
      toast({ title: 'Incomplete Form', description: 'Please fill all fields and select a rating', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const url = `${API_BASE}/products/reviews?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      const payload = {
        product_id: productId,
        review: formData.review,
        reviewer: formData.reviewer,
        reviewer_email: formData.reviewer_email || '',
        rating: formData.rating,
        status: 'approved',
      } as const;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(errTxt || 'Failed to submit review');
      }
      toast({ title: '🎉 Review Submitted!', description: 'Thank you for your feedback.' });
      setFormData({ reviewer: '', reviewer_email: '', review: '', rating: 0 });
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── STAR RATING COMPONENT ──
  const StarRating = ({
    rating,
    onChange,
    interactive = false,
    size = 'md',
  }: {
    rating: number;
    onChange?: (value: number) => void;
    interactive?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }) => {
    const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150`}
            aria-label={`Rate ${star}`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIcon className={`${sizeClass} text-[#ff3131]`} />
            ) : (
              <StarOutlineIcon className={`${sizeClass} text-gray-300 ${interactive ? 'hover:text-[#ff3131]/50' : ''} transition-colors`} />
            )}
          </button>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce<number>((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  const distribution = getRatingDistribution(reviews);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── HEADER ── */}
      <div className="px-6 md:px-10 pt-10 pb-8 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Left — Title + Average */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-5 h-5 text-[#ff3131]" />
              <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
            </div>
            <p className="text-sm text-gray-500">
              Based on <span className="font-semibold text-gray-700">{reviews.length}</span> verified review{reviews.length !== 1 ? 's' : ''}
            </p>

            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                <div>
                  <StarRating rating={Math.round(averageRating)} size="md" />
                  <p className="text-xs text-gray-500 mt-1">out of 5</p>
                </div>
              </div>
            )}
          </div>

          {/* Right — Rating distribution bars */}
          {reviews.length > 0 && (
            <div className="space-y-1.5 min-w-[200px]">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <StarIcon className="w-3 h-3 text-[#ff3131] flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff3131] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-10 py-8">

        {/* ── WRITE REVIEW BUTTON ── */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowForm((s) => !s)}
            className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              showForm
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-[#ff3131] text-white hover:bg-[#cc0000] shadow-md hover:shadow-lg hover:shadow-orange-200 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {showForm ? (
              <><X className="w-4 h-4" /> Cancel</>
            ) : (
              <><PenLine className="w-4 h-4" /> Write a Review</>
            )}
          </button>
        </div>

        {/* ── REVIEW FORM ── */}
        {showForm && (
          <form
            onSubmit={submitReview}
            className="mb-10 p-6 md:p-8 bg-gray-50 rounded-2xl border border-gray-100 space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#ff3131]" />
              <h3 className="text-base font-bold text-gray-900">Share Your Experience</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Name <span className="text-[#ff3131]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.reviewer}
                  onChange={(e) => setFormData((s) => ({ ...s, reviewer: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff3131] focus:outline-none focus:ring-2 focus:ring-[#ff3131]/10 text-sm transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Email <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.reviewer_email}
                  onChange={(e) => setFormData((s) => ({ ...s, reviewer_email: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff3131] focus:outline-none focus:ring-2 focus:ring-[#ff3131]/10 text-sm transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                Rating <span className="text-[#ff3131]">*</span>
              </label>
              <div className="flex items-center gap-3">
                <StarRating
                  rating={formData.rating}
                  onChange={(v) => setFormData((s) => ({ ...s, rating: v }))}
                  interactive
                  size="lg"
                />
                {formData.rating > 0 && (
                  <span className="text-sm text-gray-500">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                Your Review <span className="text-[#ff3131]">*</span>
              </label>
              <textarea
                required
                value={formData.review}
                onChange={(e) => setFormData((s) => ({ ...s, review: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#ff3131] focus:outline-none focus:ring-2 focus:ring-[#ff3131]/10 text-sm resize-none transition-all"
                placeholder="Tell others about your experience with this product..."
              />
              <p className="text-xs text-gray-400 mt-1">{formData.review.length} characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#ff3131] text-white hover:bg-[#cc0000] shadow-md hover:shadow-lg hover:shadow-orange-200'
              }`}
            >
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Submit Review</>
              )}
            </button>
          </form>
        )}

        {/* ── REVIEWS LIST ── */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-[#ff3131] border-t-transparent animate-spin" />
              <ShoppingBag className="absolute inset-0 m-auto w-5 h-5 text-[#ff3131]" />
            </div>
            <p className="text-gray-500 text-sm">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-[#ff3131]/40" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">No Reviews Yet</p>
            <p className="text-gray-500 text-sm">
              Be the first to review{' '}
              <span className="text-[#ff3131] font-medium">{productName}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-5 md:p-6 bg-white border border-gray-100 rounded-2xl hover:border-[#ff3131]/20 hover:shadow-sm transition-all duration-300"
              >
                {/* Reviewer info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3131] to-[#ff8c00] flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-200">
                    <span className="text-white font-bold text-sm">
                      {(r.reviewer || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{r.reviewer || 'Anonymous'}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <CheckBadgeIcon className="h-3 w-3 text-green-600" />
                        Verified Purchase
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={r.rating || 0} size="sm" />
                      {r.date_created && (
                        <span className="text-xs text-gray-400">
                          · {new Date(r.date_created).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ml-13 pl-1">
                  {stripHtml(r.review || '')}
                </p>

                {/* Review images */}
                {Array.isArray(r.images) && r.images.length > 0 && (
                  <div className="mt-4 flex gap-2 flex-wrap ml-13">
                    {r.images.map((src, i) => (
                      <button
                        key={`${r.id}-${i}`}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        className="relative group/img overflow-hidden rounded-xl border-2 border-gray-100 hover:border-[#ff3131]/40 transition-all"
                      >
                        <img
                          src={src}
                          alt={`Review image ${i + 1}`}
                          className="w-20 h-20 object-cover group-hover/img:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── IMAGE LIGHTBOX ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={() => setLightboxSrc(null)}
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxSrc}
            alt="Review"
            className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
