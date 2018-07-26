import { NestContainer } from './container';
export declare class InstanceLoader {
    private readonly container;
    private readonly injector;
    private readonly logger;
    constructor(container: NestContainer);
    createInstancesOfDependencies(): Promise<void>;
    private createPrototypes;
    private createInstances;
    private createPrototypesOfComponents;
    private createInstancesOfComponents;
    private createPrototypesOfRoutes;
    private createInstancesOfRoutes;
    private createPrototypesOfInjectables;
    private createInstancesOfInjectables;
}
