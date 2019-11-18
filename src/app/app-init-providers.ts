import { ApiService } from './services/api/api.service';
import { DataService } from './services/data/data.service';

export function onAppInit(
  apiService: ApiService,
  dataService: DataService
): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {
      apiService.getAppMeta().subscribe(appMeta => {
        dataService.setAppMeta(appMeta);
        resolve();
      });
    });
  };
}
