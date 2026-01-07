# @journeyapps-labs/reactor-mod-data-browser

## 3.0.1

### Patch Changes

- e539ae2: Make sure to clear connection array when deserializing since we are able to also swap out deserializers

## 3.0.0

### Major Changes

- c0d7e9d: Abstract connections now need to generate a V4BackendClient as we now show indexes

## 2.4.0

### Minor Changes

- 98c2c03: Add editor module allowing for various JSON utilities such as viewing JSON and downloading as JSON
- bcd307e: Support for new multi types and the ability to clear values in the forms

### Patch Changes

- a8f7424: Fix location input

## 2.3.0

### Minor Changes

- bb7000e: Rewrite the data engine

## 2.2.0

### Minor Changes

- 12e5f6a: - Add support for filters
  - Fix relationship belongs_to loading
  - Display column headings with width based on heurestics

### Patch Changes

- 687468b: - Improve relationship loading
  - Dont block kernel init with connection store

## 2.1.0

### Minor Changes

- 8cc96ec: - displays media directly inside Sector
  - add media input fields to form editing
  - status bar for schema model editing
  - make query reload button show load status
  - Add support for Locations
  - Pull in Reactor changes: Version Packages reactor#36
- bf70874: Add support for loading relationships with smart paralell limits

## 2.0.2

### Patch Changes

- 375d338: Add support for Day and number type

## 2.0.1

### Patch Changes

- 0f04f63: Fix an issue with text not showing correctly and also improve array items

## 2.0.0

### Major Changes

- 3438cf4: Name of connection changed to an EntityDescription and also export shared db library

## 1.1.0

### Minor Changes

- cd5ddb0: Export various classes and types

## 1.0.0

### Major Changes

- 60d9391: First release
