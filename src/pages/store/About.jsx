import { ArrowRight, Gem, Heart, Leaf, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const values = [
  {
    icon: Gem,
    title: 'Exceptional Craftsmanship',
    description: 'Every piece is thoughtfully designed with attention to detail, beautiful finishes, and timeless appeal.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Quality',
    description: 'We believe jewellery should inspire confidence, with transparent product information and attentive service.',
  },
  {
    icon: Heart,
    title: 'Made for Your Moments',
    description: "From everyday elegance to life's biggest celebrations, we help you find pieces worth remembering.",
  },
  {
    icon: Leaf,
    title: 'Thoughtful Choices',
    description: 'We aspire to make more thoughtful choices in design, packaging, and the way we serve our customers.',
  },
]

const collectionsLink = '/store/collections'

export default function AboutUs() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fcfaf7] text-[#17251f]">
      <section className="relative isolate flex min-h-[440px] items-center overflow-hidden sm:min-h-[520px] lg:min-h-[590px]">
        <img
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2000&q=90"
          alt="Jewellery crafted with attention to detail"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f4ece1] via-[#f4ece1]/90 to-[#f4ece1]/10" />

        <div className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-10 lg:px-14">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#986d42]">
              <Sparkles size={14} />
              The Story of Elephanta
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.1] text-[#17211c] sm:text-6xl lg:text-7xl">
              More Than
              <br />
              Jewellery.
              <span className="mt-2 block italic text-[#9b744c]">It&apos;s a Legacy.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#514b43] sm:text-base">
              We believe the most beautiful jewellery does more than complete a look. It celebrates your story, preserves your memories, and becomes a part of who you are.
            </p>
            <Link
              to={collectionsLink}
              className="mt-8 inline-flex items-center gap-3 bg-[#a77b4c] px-6 py-3.5 text-xs font-medium text-white transition hover:bg-[#815b36]"
            >
              Discover Our Collections
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-14 lg:py-24">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1100&q=90"
            alt="Fine jewellery with elegant gold detailing"
            loading="lazy"
            className="aspect-[4/4.2] w-full rounded-sm object-cover"
          />
          <div className="absolute -bottom-5 right-4 bg-[#a77b4c] px-5 py-4 text-white sm:-right-5 sm:px-7 sm:py-5">
            <p className="font-serif text-2xl italic">Elegance</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.2em]">In Every Detail</p>
          </div>
        </div>

        <div className="pt-3 lg:pt-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a77b4c]">Who We Are</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
            Jewellery that
            <span className="block italic text-[#a77b4c]">tells your story.</span>
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#777168]">
            <p>
              Welcome to Elephanta, where timeless elegance meets the joy of personal expression. We believe every piece of jewellery carries a meaning, whether it marks a milestone, celebrates a relationship, or simply makes an ordinary day special.
            </p>
            <p>
              Our collections bring together graceful designs, carefully considered details, and styles for life&apos;s many occasions. From statement necklaces and delicate rings to beautiful earrings and bangles, we want every discovery to feel personal.
            </p>
            <p>
              More than a jewellery destination, Elephanta is a place to discover pieces that reflect your individuality and become part of your most treasured memories.
            </p>
          </div>
          <Link
            to="/store/products"
            className="mt-7 inline-flex items-center gap-2 border-b border-[#a77b4c] pb-2 text-xs font-semibold text-[#8f673f] transition hover:text-[#17251f]"
          >
            Explore Our Jewellery
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#102923]">
        <img
          src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1800&q=85"
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 -z-10 bg-[#0d2821]/75" />
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-10 sm:py-24">
          <Sparkles size={25} strokeWidth={1.2} className="mx-auto text-[#d7b57b]" />
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d7b57b]">Our Philosophy</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-3xl leading-snug text-white sm:text-4xl lg:text-5xl">
            &ldquo;True luxury is not just what you wear, but what it means to you.&rdquo;
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/70">
            We celebrate the beauty of individuality, the emotion behind every gift, and the memories that make each piece special.
          </p>
          <div className="mx-auto mt-8 h-px w-16 bg-[#c9a16c]" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a77b4c]">What Makes Us Different</p>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">The Values We Treasure</h2>
          <p className="mt-4 text-sm leading-7 text-[#777168]">
            The principles behind every design, every detail, and every customer experience.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group border border-[#eee5da] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d6b991] hover:shadow-lg hover:shadow-[#30251a]/5 sm:p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e9d9c4] text-[#a77b4c] transition group-hover:bg-[#a77b4c] group-hover:text-white">
                <Icon size={21} strokeWidth={1.4} />
              </div>
              <h3 className="mt-6 font-serif text-xl leading-snug">{title}</h3>
              <p className="mt-3 text-xs leading-6 text-[#777168]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#f2ebe2]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 sm:px-10 sm:py-18 lg:grid-cols-2 lg:gap-16 lg:px-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a77b4c]">Crafted With Passion</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Beauty in every
              <span className="block italic text-[#a77b4c]">little detail.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#777168]">
              We believe exceptional jewellery begins with thoughtful design. The interplay of shapes, the warmth of gold, the sparkle of a stone, and the finishing touches all contribute to a piece that feels uniquely yours.
            </p>
            <p className="mt-4 text-sm leading-7 text-[#777168]">
              Our goal is to make discovering jewellery a delightful experience, with collections that complement your style and pieces you will love to wear and share.
            </p>
            <Link
              to="/store/products"
              className="mt-7 inline-flex items-center gap-3 bg-[#152c24] px-5 py-3.5 text-xs font-medium text-white transition hover:bg-[#a77b4c]"
            >
              Find Your Favourite
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=90"
              alt="Elegant ring showcasing fine jewellery details"
              loading="lazy"
              className="aspect-[5/4] w-full rounded-sm object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center gap-1 text-[#b58a5a]" aria-label="Five-star rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={15} fill="currentColor" aria-hidden="true" />
            ))}
          </div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a77b4c]">Your Story Starts Here</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
            Find something
            <span className="italic text-[#a77b4c]"> extraordinary.</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#777168]">
            Explore our collections and discover jewellery that celebrates your style, your milestones, and your most meaningful moments.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={collectionsLink}
              className="inline-flex items-center justify-center gap-3 bg-[#a77b4c] px-6 py-3.5 text-xs font-medium text-white transition hover:bg-[#815b36]"
            >
              Explore Collections
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border border-[#dfd3c4] px-6 py-3.5 text-xs font-medium transition hover:border-[#a77b4c] hover:bg-[#f8f3ed]"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
