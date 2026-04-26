export class PluginRegistry {
  private readonly installed = new Map<string, unknown>()

  set (name: string, ext: unknown): void {
    this.installed.set(name, ext)
  }

  get (name: string): unknown {
    return this.installed.get(name)
  }

  has (name: string): boolean {
    return this.installed.has(name)
  }

  names (): string[] {
    return [...this.installed.keys()]
  }
}
