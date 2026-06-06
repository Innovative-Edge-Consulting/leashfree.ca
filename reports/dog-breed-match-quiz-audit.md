# Dog Breed Match Quiz Data Audit

Date: 2026-06-06

## Summary

The existing breed database is strong enough to support a v1 Dog Breed Match Quiz without sourcing additional core breed information.

The generated data at `src/data/generated/dog-breeds.json` contains 310 breed records with structured lifestyle fields that map directly to quiz scoring:

- Breed Group
- Size Category
- Coat Type
- Coat Texture
- Activity Level
- Trainability
- Shedding Level
- Family Friendly
- Apartment Friendly
- Hypoallergenic
- Dog Breed Type

Each breed record also includes rich text sections for summary, grooming, exercise needs, training tips, health concerns, FAQs, and adoption/breeder notes. Those can support result explanations and "things to consider" copy.

## Field Coverage

| Field | Values | Notes |
| --- | --- | --- |
| Breed Group | Working, Herding, Sporting, Hound, Hybrid, Terrier, Non-Sporting, Toy, Miscellaneous | 9 blank records |
| Size Category | Small, Medium, Large, Extra Large | 9 blank records |
| Coat Type | Double Coat, Short, Single, Medium, Long, Varies, Curly, Hairless | 10 blank records |
| Coat Texture | Smooth, Dense, Wavy, Wiry, Silky, Straight, Curly, Soft, Woolly, Fluffy, Double Coat, Feathered, Wire-haired | 9 blank records |
| Activity Level | Low, Moderate, High, Very High | 11 blank records |
| Trainability | Low, Moderate, High, Very High, Expert Required | 9 blank records |
| Shedding Level | Minimal, Low, Moderate, High | 9 blank records |
| Family Friendly | Yes, With Older Kids, No | 10 blank records |
| Apartment Friendly | Yes, With Caveats, No | 11 blank records |
| Hypoallergenic | Yes, No | 9 blank records |
| Dog Breed Type | Purebred, Designer, Mixed | 9 blank records |

## Recommended V1 Quiz Questions

1. Home type / space
   - Apartment or condo
   - Townhouse or small home
   - House with yard
   - Rural or acreage

2. Daily activity commitment
   - Short walks and indoor play
   - Regular walks and weekend outings
   - Long walks, hikes, or runs
   - Very active working or sport lifestyle

3. Preferred dog size
   - Small
   - Medium
   - Large
   - Extra large
   - No preference

4. Grooming and shedding tolerance
   - Minimal shedding preferred
   - Low to moderate shedding is fine
   - Grooming effort is fine if the fit is right

5. Household makeup
   - Adults only
   - Family with older kids
   - Family with young kids
   - Other pets in the home

6. Training experience
   - First-time owner
   - Some experience
   - Experienced owner
   - Comfortable with challenging or independent breeds

7. Allergy sensitivity
   - Need lower-shedding or hypoallergenic-leaning breeds
   - Helpful but not required
   - Not a concern

8. Breed type preference
   - Purebred
   - Designer or mixed breeds
   - No preference

## Proposed Scoring Model

Use a weighted additive score. Do not present the result as a medical, behavioral, or guaranteed compatibility assessment.

Recommended weights:

| Match Dimension | Database Field | Weight |
| --- | --- | --- |
| Activity fit | Activity Level | 25 |
| Home/space fit | Apartment Friendly + Size Category | 20 |
| Size preference | Size Category | 15 |
| Shedding/allergy fit | Shedding Level + Hypoallergenic | 15 |
| Family fit | Family Friendly | 10 |
| Training fit | Trainability | 10 |
| Breed type preference | Dog Breed Type | 5 |

The scoring should reward close fits, not only exact matches. Example: if a user selects moderate activity, `Moderate` should score highest, `Low` and `High` should receive partial credit, and `Very High` should be penalized.

## Result Output

Each result card should include:

- Breed name
- Breed image
- Match strength
- 2-3 "why this matched" bullets generated from matched fields
- 1 "consider this" note from the highest-risk mismatch or from a known trait
- Link to the breed profile

Example explanation logic:

- `Apartment Friendly = Yes`: "A practical fit for apartment or condo living."
- `Activity Level = High`: "Best for owners who can provide daily exercise and enrichment."
- `Shedding Level = Minimal` or `Low`: "A better fit if shedding is a concern."
- `Trainability = Low` or `Expert Required`: "May be better for experienced, consistent handlers."
- `Family Friendly = With Older Kids`: "Likely better suited to households with older children who respect boundaries."

## Data Gaps

The v1 quiz can be built without more data, but these fields would improve future versions:

- Time alone / separation tolerance
- Good with other dogs
- Good with cats or small pets
- Barking/vocal tendency
- Prey drive
- Weather or climate sensitivity
- Recommended owner experience level
- Grooming effort as a normalized field, separate from coat type

Some of this can be inferred from body text, but inferred traits should be reviewed before becoming structured scoring inputs.

## SEO Implementation Notes

Recommended URL:

`/resources/dog-breed-match-quiz/`

Recommended primary title:

`Dog Breed Match Quiz: Find the Best Dog Breed for Your Lifestyle`

Recommended metadata:

`Answer a few questions about your home, schedule, activity level, and preferences to find dog breeds that may fit your lifestyle.`

Recommended schema:

- `BreadcrumbList`
- `FAQPage`
- `WebApplication` for the quiz tool

Recommended internal links:

- Add the quiz to `/resources/`
- Add the quiz to the header Resources dropdown
- Add the quiz to the sitemap core section
- Link from `/dog-breeds/` near the search/filter section
- Link results to `/dog-breeds/{slug}/`

## Build Recommendation

Proceed with a v1 using the existing data.

No additional sourced breed information is required before implementation. The only user decision needed before build is whether the quiz should prefer a compact 6-question flow or a more precise 8-question flow. The 8-question flow is recommended because it maps more cleanly to the available data and still stays short enough for mobile users.
