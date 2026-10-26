import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import RemoteImage from "./RemoteImage";
import {
  createProductReview,
  getProductReview,
  getProductReviews,
  updateProductReview,
} from "../../services/productapi";
import { loadCustomerAuth } from "../../services/authapi";
import { uploadMedia } from "../../services/mediaapi";

const REVIEW_PAGE_SIZE = 5;

function normalizeReview(review) {
  const imageIds = review?.imageIds ?? review?.ImageIds ?? [];
  return {
    id: review?.id ?? review?.Id,
    rating: Number(review?.rating ?? review?.Rating ?? 0),
    comment: review?.comment ?? review?.Comment ?? "",
    userId: review?.userId ?? review?.UserId,
    firstName: review?.userFirstName ?? review?.UserFirstName ?? "",
    lastName: review?.userLastName ?? review?.UserLastName ?? "",
    imageIds: Array.isArray(imageIds) ? imageIds : [],
  };
}

function getReviewItems(response) {
  const items = Array.isArray(response)
    ? response
    : response?.items ?? response?.Items ?? [];
  return Array.isArray(items) ? items.map(normalizeReview) : [];
}

function getReviewTotalCount(response) {
  const value =
    response?.totalCount ??
    response?.TotalCount ??
    response?.totalRecords ??
    response?.TotalRecords ??
    response?.totalItems ??
    response?.TotalItems;
  const count = Number(value);
  return value !== undefined && Number.isFinite(count) && count >= 0
    ? count
    : null;
}

function getCustomerId(auth) {
  const user = auth?.user ?? auth?.User ?? {};
  const id =
    user.id ??
    user.Id ??
    user.userId ??
    user.UserId ??
    user.sub ??
    user.nameIdentifier ??
    user.nameidentifier ??
    user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  return id == null || String(id).trim() === "" ? null : String(id);
}

export default function ProductReviews({
  productId,
  averageRating = 0,
  initialReviewCount = 0,
  onReviewCountChange,
}) {
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewPageNumber, setReviewPageNumber] = useState(1);
  const [reviewTotalCount, setReviewTotalCount] = useState(
    () => Number(initialReviewCount) || 0
  );
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewFormError, setReviewFormError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewDetailsLoading, setReviewDetailsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [selectedReviewImage, setSelectedReviewImage] = useState("");
  const reviewImageObjectUrls = useRef(new Set());
  const reviewFormRef = useRef(null);
  const customerAuth = loadCustomerAuth();
  const customerId = getCustomerId(customerAuth);
  const ownReviews = customerId
    ? reviews.filter(
        (review) =>
          review.userId != null && String(review.userId) === customerId
      )
    : [];
  const isEditingReview = editingReviewId !== null;
  const reviewTotalPages = Math.max(
    1,
    Math.ceil(reviewTotalCount / REVIEW_PAGE_SIZE)
  );

  useEffect(
    () => () => {
      reviewImageObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      reviewImageObjectUrls.current.clear();
    },
    []
  );

  useEffect(() => {
    if (editingReviewId !== null) {
      reviewFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingReviewId]);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const response = await getProductReviews(
          productId,
          reviewPageNumber,
          REVIEW_PAGE_SIZE
        );
        if (!cancelled) {
          const items = getReviewItems(response);
          const responseTotalCount = getReviewTotalCount(response);
          setReviews(items);
          if (responseTotalCount !== null) {
            setReviewTotalCount(responseTotalCount);
            onReviewCountChange?.(responseTotalCount);
          } else {
            const minimumTotalCount =
              (reviewPageNumber - 1) * REVIEW_PAGE_SIZE + items.length;
            setReviewTotalCount((current) =>
              Math.max(current, minimumTotalCount)
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setReviewsError(error?.message || "Unable to load reviews.");
        }
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    if (productId) loadReviews();
    return () => {
      cancelled = true;
    };
  }, [
    productId,
    reviewPageNumber,
    reviewRefreshKey,
    onReviewCountChange,
  ]);

  const clearReviewImagePreviews = () => {
    reviewImageObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    reviewImageObjectUrls.current.clear();
  };

  const handleReviewImageSelection = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    if (files.some((file) => !file.type.startsWith("image/"))) {
      setReviewFormError("Only image files can be uploaded.");
      return;
    }
    if (reviewImages.length + files.length > 2) {
      setReviewFormError("You can upload a maximum of 2 images.");
      return;
    }

    const selectedImages = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      reviewImageObjectUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setReviewImages((current) => [...current, ...selectedImages]);
    setReviewFormError("");
  };

  const handleRemoveReviewImage = (index) => {
    const image = reviewImages[index];
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
      reviewImageObjectUrls.current.delete(image.previewUrl);
    }
    setReviewImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    );
    setReviewFormError("");
  };

  const handleEditReview = async (reviewToEdit) => {
    if (
      !reviewToEdit?.id ||
      !ownReviews.some(
        (review) => String(review.id) === String(reviewToEdit.id)
      )
    ) {
      return;
    }
    setReviewFormError("");
    setReviewNotice("");
    setReviewDetailsLoading(true);
    try {
      const response = await getProductReview(reviewToEdit.id);
      const review = normalizeReview(response);
      setReviewRating(review.rating || 5);
      setReviewComment(review.comment);
      clearReviewImagePreviews();
      setReviewImages(
        review.imageIds.map((imageId) => ({
          id: imageId,
          src: `/api/Media/${imageId}`,
        }))
      );
      setEditingReviewId(review.id ?? reviewToEdit.id);
    } catch (error) {
      setReviewFormError(error?.message || "Unable to load your review.");
    } finally {
      setReviewDetailsLoading(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewFormError("");
    setReviewNotice("");

    const comment = reviewComment.trim();
    if (
      !Number.isInteger(Number(reviewRating)) ||
      Number(reviewRating) < 1 ||
      Number(reviewRating) > 5
    ) {
      setReviewFormError("Choose a rating from 1 to 5.");
      return;
    }
    if (!comment) {
      setReviewFormError("Write a comment for your review.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const imageIds = [];
      const submittedImages = [];
      for (const image of reviewImages) {
        if (image.id) {
          imageIds.push(image.id);
          submittedImages.push(image);
          continue;
        }

        const uploadResponse = await uploadMedia({
          file: image.file,
          moduleType: "product-review",
          scope: "customer",
        });
        const imageId =
          typeof uploadResponse === "string"
            ? uploadResponse
            : uploadResponse?.id ?? uploadResponse?.Id;
        if (!imageId) {
          throw new Error("Image upload completed without returning an image ID.");
        }

        imageIds.push(imageId);
        const uploadedImage = {
          id: imageId,
          src: `/api/Media/${imageId}`,
          moduleType: "product-review",
        };
        submittedImages.push(uploadedImage);
        setReviewImages((current) =>
          current.map((currentImage) =>
            currentImage === image ? uploadedImage : currentImage
          )
        );
      }

      setReviewImages(submittedImages);
      const payload = {
        rating: Number(reviewRating),
        comment,
        imageIds,
      };
      if (isEditingReview) {
        const reviewToUpdate = ownReviews.find(
          (review) => String(review.id) === String(editingReviewId)
        );
        if (!reviewToUpdate?.id) {
          throw new Error("Unable to verify your review for updating.");
        }
        await updateProductReview(reviewToUpdate.id, payload);
      } else {
        await createProductReview(productId, payload);
      }

      if (!isEditingReview) {
        setReviewPageNumber(1);
        const updatedCount = reviewTotalCount + 1;
        setReviewTotalCount(updatedCount);
        onReviewCountChange?.(updatedCount);
      }
      setReviewRefreshKey((current) => current + 1);
      clearReviewImagePreviews();
      setReviewImages([]);
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewComment("");
      setReviewNotice(
        isEditingReview ? "Your review was updated." : "Your review was added."
      );
    } catch (error) {
      setReviewFormError(error?.message || "Unable to save your review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div id="reviews">
      <h2 className="font-serif text-2xl">Customer Reviews</h2>
      <div className="mt-5 rounded-lg border border-[#eae3da] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-serif text-5xl">
            {Number(averageRating || 0).toFixed(1)}
          </span>
          <div>
            <div className="flex gap-1 text-[#c79643]">
              {[1, 2, 3, 4, 5].map((item) => (
                <Star
                  key={item}
                  size={17}
                  className={
                    item <= Math.round(Number(averageRating || 0))
                      ? "fill-current"
                      : ""
                  }
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[#817a71]">
              Based on {reviewTotalCount} reviews
            </p>
          </div>
        </div>
      </div>

      {reviewsLoading && (
        <p role="status" className="mt-5 text-sm text-[#817a71]">
          Loading reviews...
        </p>
      )}
      {reviewsError && (
        <p role="alert" className="mt-5 text-sm text-red-700">
          Unable to load reviews: {reviewsError}
        </p>
      )}
      {!reviewsLoading && !reviewsError && reviews.length === 0 && (
        <p className="mt-5 text-sm text-[#817a71]">
          No reviews yet. Be the first to review this product.
        </p>
      )}
      {!reviewsLoading && !reviewsError && reviews.length > 0 && (
        <div className="mt-5 space-y-3">
          {reviews.map((review, index) => {
            const reviewerName =
              `${review.firstName} ${review.lastName}`.trim() || "Customer";
            return (
              <article
                key={review.id ?? `${review.userId}-${index}`}
                className="rounded-lg border border-[#eae3da] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#172521]">
                      {reviewerName}
                    </p>
                    <div
                      className="mt-2 flex gap-1 text-[#c79643]"
                      aria-label={`Rated ${review.rating} out of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((item) => (
                        <Star
                          key={item}
                          size={15}
                          className={item <= review.rating ? "fill-current" : ""}
                        />
                      ))}
                    </div>
                  </div>
                  {customerAuth?.accessToken &&
                    customerId &&
                    review.id != null &&
                    String(review.userId) === customerId && (
                      <button
                        type="button"
                        onClick={() => handleEditReview(review)}
                        disabled={reviewDetailsLoading || reviewSubmitting}
                        className="text-xs font-medium text-[#89633d] hover:underline disabled:opacity-50"
                      >
                        {reviewDetailsLoading &&
                        String(editingReviewId) === String(review.id)
                          ? "Loading..."
                          : "Edit your review"}
                      </button>
                    )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#777168]">
                  {review.comment}
                </p>
                {review.imageIds.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.imageIds.map((imageId, imageIndex) => {
                      const imageSrc = `/api/Media/${encodeURIComponent(imageId)}`;
                      return (
                        <button
                          key={`${review.id ?? index}-${imageId}`}
                          type="button"
                          onClick={() => setSelectedReviewImage(imageSrc)}
                          aria-label={`View review image ${imageIndex + 1}`}
                          className="h-20 w-20 overflow-hidden rounded-md border border-[#eae3da] bg-[#f3ece3] transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#a78051]"
                        >
                          <RemoteImage
                            src={imageSrc}
                            alt={`Review image ${imageIndex + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {!reviewsLoading && !reviewsError && reviewTotalPages > 1 && (
        <nav
          aria-label="Review pagination"
          className="mt-6 flex flex-col gap-3 border-t border-[#eae3da] pt-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {reviews.length > 0 && (
            <p className="text-xs text-[#817a71]">
              Showing {(reviewPageNumber - 1) * REVIEW_PAGE_SIZE + 1}–
              {(reviewPageNumber - 1) * REVIEW_PAGE_SIZE + reviews.length} of{" "}
              {reviewTotalCount} reviews
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setReviewPageNumber((page) => Math.max(1, page - 1))
              }
              disabled={reviewPageNumber <= 1}
              className="rounded-md border border-[#dfd4c7] px-3 py-2 text-xs font-medium text-[#777168] hover:border-[#a78051] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-[#817a71]">
              Page {reviewPageNumber} of {reviewTotalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setReviewPageNumber((page) =>
                  Math.min(reviewTotalPages, page + 1)
                )
              }
              disabled={reviewPageNumber >= reviewTotalPages}
              className="rounded-md border border-[#dfd4c7] px-3 py-2 text-xs font-medium text-[#777168] hover:border-[#a78051] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </nav>
      )}

      {selectedReviewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review image preview"
          onClick={() => setSelectedReviewImage("")}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-full max-w-full items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setSelectedReviewImage("")}
              aria-label="Close image preview"
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white px-3 py-1.5 text-lg leading-none text-[#172521] shadow"
            >
              ×
            </button>
            <RemoteImage
              src={selectedReviewImage}
              alt="Customer review"
              className="max-h-[85vh] max-w-[90vw] rounded-md object-contain"
            />
          </div>
        </div>
      )}

      <div
        ref={reviewFormRef}
        className="mt-6 scroll-mt-24 rounded-lg border border-[#eae3da] bg-white p-5 sm:p-6"
      >
        {!customerAuth?.accessToken ? (
          <p className="text-sm text-[#817a71]">
            <Link to="/login" className="font-medium text-[#89633d] hover:underline">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        ) : reviewsLoading ? (
          <p role="status" className="text-sm text-[#817a71]">
            Loading reviews...
          </p>
        ) : (
          <form onSubmit={handleReviewSubmit}>
            <h3 className="font-serif text-xl">
              {isEditingReview
                ? "Update your review"
                : ownReviews.length > 0
                  ? "Write another review"
                  : "Write a review"}
            </h3>
            <fieldset className="mt-4">
              <legend className="mb-2 text-xs font-medium text-[#34423b]">
                Rating
              </legend>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating} className="cursor-pointer rounded-sm">
                    <input
                      type="radio"
                      name="product-review-rating"
                      value={rating}
                      checked={reviewRating === rating}
                      onChange={() => setReviewRating(rating)}
                      disabled={reviewSubmitting}
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      className="peer sr-only"
                    />
                    <span className="inline-flex rounded-sm p-1 text-[#c79643] transition hover:scale-110 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#a78051]">
                      <Star
                        size={24}
                        aria-hidden="true"
                        className={rating <= reviewRating ? "fill-current" : ""}
                      />
                    </span>
                  </label>
                ))}
                <span className="ml-2 text-xs text-[#817a71]">
                  {reviewRating} {reviewRating === 1 ? "star" : "stars"}
                </span>
              </div>
            </fieldset>
            <div className="mt-4">
              <label
                htmlFor="product-review-comment"
                className="mb-2 block text-xs font-medium text-[#34423b]"
              >
                Your review
              </label>
              <textarea
                id="product-review-comment"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                rows={4}
                maxLength={2000}
                required
                className="w-full rounded-md border border-[#dfd4c7] bg-white p-3 text-sm outline-none focus:border-[#a78051]"
                placeholder="Share your thoughts about this product"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="product-review-images"
                className="mb-2 block text-xs font-medium text-[#34423b]"
              >
                Images (optional, up to 2)
              </label>
              {reviewImages.length < 2 && (
                <input
                  id="product-review-images"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={reviewSubmitting}
                  onChange={handleReviewImageSelection}
                  className="block w-full text-xs text-[#777168] file:mr-3 file:rounded-md file:border-0 file:bg-[#f3ece3] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#89633d] hover:file:bg-[#eae0d4] disabled:opacity-50"
                />
              )}
              <p className="mt-2 text-xs text-[#817a71]">
                {reviewImages.length} of 2 images selected.
              </p>
              {reviewImages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {reviewImages.map((image, index) => (
                    <div
                      key={
                        image.id ??
                        `${image.file?.name}-${image.file?.lastModified}-${index}`
                      }
                      className="relative h-24 w-24 overflow-hidden rounded-md border border-[#eae3da] bg-[#f3ece3]"
                    >
                      {image.file ? (
                        <img
                          src={image.previewUrl}
                          alt={`Review upload ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <RemoteImage
                          src={image.src ?? `/api/Media/${image.id}`}
                          alt={`Review image ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewImage(index)}
                        disabled={reviewSubmitting}
                        aria-label={`Remove review image ${index + 1}`}
                        className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-1 text-[10px] text-white hover:bg-black disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {reviewFormError && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {reviewFormError}
              </p>
            )}
            {reviewNotice && (
              <p role="status" className="mt-3 text-sm text-green-700">
                {reviewNotice}
              </p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-md bg-[#102722] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-[#a78051] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewSubmitting
                  ? "Saving..."
                  : isEditingReview
                    ? "Update review"
                    : "Submit review"}
              </button>
              {isEditingReview && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReviewId(null);
                    setReviewFormError("");
                    setReviewRating(5);
                    setReviewComment("");
                    clearReviewImagePreviews();
                    setReviewImages([]);
                  }}
                  disabled={reviewSubmitting}
                  className="rounded-md border border-[#dfd4c7] px-5 py-2.5 text-xs font-medium text-[#777168] disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
