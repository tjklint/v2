import { Header } from '../header/header'
import { Wallpaper } from '../wallpaper/wallpaper'

export function Os() {
  return (
    <div className="relative h-full overflow-hidden">
      <Wallpaper />
      <Header />
    </div>
  )
}
