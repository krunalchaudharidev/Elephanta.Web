import { useRef, useState } from 'react'
import { ShoppingCart, Trash2 } from 'lucide-react'
import {
  addCartItem,
  deleteCartItem,
  getCartSessionId,
  updateCartItem,
} from '../../services/cartapi'

function getResponseQuantity(response, fallback) {
  const quantity = Number(response?.quantity ?? response?.Quantity)
  return Number.isFinite(quantity) && quantity > 0 ? quantity : fallback
}

export default function CartActionButton({
  productId,
  quantity = 1,
  cartItem,
  onCartItemChange,
  cartLoading = false,
  isAvailable = true,
  className,
  iconSize = 17,
  showCartQuantity = false,
  allowRemove = false,
  removePlacement = 'inline',
  productName,
  removeLabel,
  removeClassName,
  onSuccess,
  onError,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [action, setAction] = useState('')
  const submittingRef = useRef(false)

  async function runAction(nextAction) {
    if (
      !productId ||
      cartLoading ||
      submittingRef.current ||
      (nextAction !== 'remove' && !isAvailable) ||
      (nextAction === 'remove' && !cartItem)
    ) return

    submittingRef.current = true
    setSubmitting(true)
    setAction(nextAction)
    try {
      const sessionId = getCartSessionId()
      if (nextAction === 'remove') {
        await deleteCartItem(cartItem.id, sessionId)
        onCartItemChange?.(null)
        onSuccess?.({ removed: true, quantity: cartItem.quantity })
      } else if (cartItem) {
        const updatedItem = await updateCartItem(cartItem.id, quantity, sessionId)
        const updatedQuantity = getResponseQuantity(updatedItem, quantity)
        onCartItemChange?.({ ...cartItem, quantity: updatedQuantity })
        onSuccess?.({ updated: true, quantity: updatedQuantity })
      } else {
        const addedItem = await addCartItem(productId, quantity, sessionId)
        const itemId = addedItem?.id ?? addedItem?.Id
        if (itemId === null || itemId === undefined) {
          throw new Error('The cart API did not return the created item ID.')
        }
        const addedQuantity = getResponseQuantity(addedItem, quantity)
        onCartItemChange?.({
          id: itemId,
          quantity: addedQuantity,
        })
        onSuccess?.({ updated: false, quantity: addedQuantity })
      }
    } catch (error) {
      console.error(`Failed to ${nextAction} cart item.`, error)
      onError?.(error)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
      setAction('')
    }
  }

  const label = !isAvailable
    ? 'Unavailable'
    : cartLoading
      ? 'Checking cart...'
      : submitting
        ? action === 'remove'
          ? 'Removing...'
          : cartItem
            ? 'Updating...'
            : 'Adding...'
        : cartItem
          ? 'Update Cart'
          : 'Add to Cart'
  const isInlineRemove = allowRemove && removePlacement === 'inline'
  const wrapperClassName = !allowRemove
    ? undefined
    : isInlineRemove
      ? 'flex items-stretch gap-2'
      : 'flex w-full flex-col gap-2'

  return (
    <div className={wrapperClassName}>
      <button
        type="button"
        onClick={() => runAction('upsert')}
        disabled={!isAvailable || cartLoading || submitting}
        className={`${className ?? ''}${isInlineRemove ? ' min-w-0 flex-1' : ''}`}
      >
        <ShoppingCart size={iconSize} />
        {label}
        {showCartQuantity && cartItem && (
          <span className="ml-1 rounded-full bg-white/15 px-2 py-1 text-[9px]">
            In cart: {cartItem.quantity}
          </span>
        )}
      </button>
      {allowRemove && cartItem && (
        <button
          type="button"
          onClick={() => runAction('remove')}
          disabled={cartLoading || submitting}
          aria-label={`Remove ${productName || 'item'} from cart`}
          title="Remove from cart"
          className={removeClassName}
        >
          <Trash2 size={iconSize} aria-hidden="true" />
          {removeLabel}
        </button>
      )}
    </div>
  )
}
